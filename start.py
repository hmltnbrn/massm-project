import sys
import os
import sqlite3

import pandas as pd

from flask import Flask, jsonify
from flask import render_template

app = Flask(__name__)

DATABASE = os.path.join(app.root_path, "recruit.db")

def df_fetch(cursor):
    df = pd.DataFrame(cursor.fetchall())
    if not df.empty:
        df.columns = [col[0] for col in cursor.description]
    return df

def query_db(query):

    result_dict = {}

    try:
        connection = sqlite3.connect(DATABASE)

        cursor = connection.cursor()
        cursor.execute(query)
        result_dict = df_fetch(cursor)

    except sqlite3.OperationalError as e:
        print("Db operation error", e)
        result_dict["error"] = str(e)
    except:
        e = sys.exc_info()[0]
        print("An error occurred with the database", e)
        result_dict["error"] = str(e)
    else:
        cursor.close()
        connection.close()

    return result_dict

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/state/risk', methods=['GET'])
def get_state_risk():

    result_df = query_db('''WITH at_risk AS (SELECT state, COUNT(id) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE GROUP BY state),
                            risk_aggs AS (SELECT MAX(total) AS max_num, MIN(total) AS min_num FROM at_risk)
                            SELECT ar.state, ar.total, (((ar.total-ra.min_num)*1.0/(ra.max_num-ra.min_num)*1.0)*100) AS percentage FROM at_risk ar, risk_aggs ra;''')
    result_dict = result_df.to_dict('records')

    return jsonify({'data': result_dict})

@app.route('/api/state/stability', methods=['GET'])
def get_state_stability():

    result_df = query_db('''WITH at_risk AS (SELECT state, AVG(economic_stability) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE GROUP BY state),
                            risk_aggs AS (SELECT MAX(total) AS max_num, MIN(total) AS min_num FROM at_risk)
                            SELECT ar.state, ar.total, (((ar.total-ra.min_num)*1.0/(ra.max_num-ra.min_num)*1.0)*100) AS percentage FROM at_risk ar, risk_aggs ra;''')
    result_dict = result_df.to_dict('records')

    return jsonify({'data': result_dict})

@app.route('/api/demo/race', methods=['GET'])
def get_demo_race():

    result_df = query_db('''SELECT race_code, gender, COUNT(id) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE GROUP BY race_code, gender;''')
    result_dict = result_df.to_dict('records')

    return jsonify({'data': result_dict})

@app.route('/api/demo/education', methods=['GET'])
def get_demo_education():

    result_df = query_db('''SELECT coalesce(education_id, 0) AS education_id, gender, COUNT(id) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE GROUP BY education_id, gender;''')
    result_dict = result_df.to_dict('records')

    return jsonify({'data': result_dict})

@app.route('/api/demo/ownership', methods=['GET'])
def get_demo_home():

    result_df = query_db('''SELECT home_owner, gender, COUNT(id) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE AND home_owner != ' ' GROUP BY home_owner, gender
                            UNION ALL
                            SELECT 'N' AS home_owner, gender, COUNT(id) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE AND home_owner = ' ' GROUP BY home_owner, gender''')
    result_dict = result_df.to_dict('records')

    return jsonify({'data': result_dict})

@app.route('/api/social/risk', methods=['GET'])
def get_social_risk():

    result_df = query_db('''SELECT 'youtube' AS platform, youtube_user_rank AS social_rank, COUNT(id) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE GROUP BY youtube_user_rank
                            UNION ALL
                            SELECT 'facebook' AS platform, facebook_user_rank AS social_rank, COUNT(id) AS total FROM customer WHERE (is_smoker IS TRUE OR is_exerciser IS FALSE) AND has_insurance IS FALSE GROUP BY facebook_user_rank;''')
    result_dict = result_df.to_dict('records')

    return jsonify({'data': result_dict})

if __name__ == '__main__':
    app.run()
