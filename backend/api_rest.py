from flask import Flask, request, jsonify 
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson.json_util import dumps
import datetime
from datetime import timedelta
import os

app = Flask(__name__)
CORS(app)

mongo_user = os.getenv('MONGO_USERNAME') 
mongo_pwd = os.getenv('MONGO_PASSWORD') 
mongo_host = os.getenv('MONGO_HOST')  
mongo_port = os.getenv('MONGO_PORT')
client = MongoClient(f'mongodb://{mongo_user}:{mongo_pwd}@{mongo_host}:{mongo_port}/') 
db = client.sensorData 
collection = db.readings 


@app.route('/data', methods=['GET'])
@cross_origin(origin='*')
def get_data():
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        topic = request.args.get('topic')

        start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)

        query = {
            'timestamp': {'$gte': start_date, '$lt': end_date},
            'topic': topic 
        }
        data = collection.find(query)
        return dumps(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)