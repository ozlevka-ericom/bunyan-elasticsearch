var Writable = require('stream').Writable;
var util = require('util');
const esWrapper = require('./eswrapper');
var moment = require('moment');
const async = require('async');
const Queue = require('queue-fifo');

var levels = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal'
};

function generateIndexName (pattern, entry) {
  return moment.utc(entry.timestamp).format(pattern);
}

function callOrString (value, entry) {
  if (typeof(value) === 'function') {
    return value(entry);
  }
  return value;
}




function ElasticsearchStream (options) {
  options = options || {};
  const client = options.wrapper || new esWrapper(options);
  this._client = client;
  this._systemId = options.logSystemID || "1111-1111-1111-111";
  const queue = new Queue();
  this.queue = queue;
  Writable.call(this, options);
  this.interval = setInterval(function(){
      if(!queue.isEmpty()) {
          setTimeout(async function(){
              if(await client.checkReady()) {
                  const maxIndex = options.bulkSize || 100;
                  const dataset = [];
                  while(!queue.isEmpty() && dataset.length < maxIndex) {
                      dataset.push(queue.dequeue());
                  }
                  const index = [(options.writeIndexPrefix || 'reports-'), moment().format(options.dateFormat || 'YYYY.MM.DD')].join('');
                  try {
                      const bulkResult = await client.bulk(dataset, index);
                      console.log(bulkResult);
                  } catch(e) {
                      if(options.logLevel === 'trace') {
                          console.error(e);
                      }
                  }
              } else {
                  if(queue.size() > 100000) {
                      queue.clear();
                  }
              }
          }, 10)
      }
  }, 10);
}



util.inherits(ElasticsearchStream, Writable);

ElasticsearchStream.prototype.stop = function() {
    clearInterval(this.interval);
};

ElasticsearchStream.prototype.write = function(record) {
    this._write(record, 'UTF-8');
};

ElasticsearchStream.prototype._write = function (entry, encoding, callback) {

  //entry = JSON.parse(entry.toString('utf8'));

  // Reassign these fields so them match what the default Kibana dashboard 
  // expects to see.
  if('time' in entry) {
      entry['@timestamp'] = entry.time;
  } else {
      entry['@timestamp'] = new Date();
  }
  entry["logSystemID"] = this._systemId;
  this.queue.enqueue(entry);
};

module.exports = ElasticsearchStream;
