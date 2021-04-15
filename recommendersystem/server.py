from flask import Flask, jsonify
from waitress import serve
import numpy as np
import pickle

app = Flask(__name__)


@app.route('/recommend/<id>')
def get_recommendation(id):
    model = pickle.load(open('model.pickle', 'rb'))
    interactions = pickle.load(open('interactions.pickle', 'rb'))
    item_features = pickle.load(open('item_features.pickle', 'rb'))
    user_features = pickle.load(open('user_features.pickle', 'rb'))
    user_dict = pickle.load(open('user_dict.pickle', 'rb'))
    item_dict = pickle.load(open('item_dict.pickle', 'rb'))

    n_items = interactions.shape[1]

    if (id in user_dict):
        user_id = user_dict[id]

        scores = model.predict(user_id, np.arange(
            n_items), item_features, user_features)

        top_items_for_user = item_dict[np.argsort(-scores)]
        response = []
        for x in top_items_for_user[:5]:
            response.append(x)
        return jsonify(response)
    else:
        return "", 404


if __name__ == "__main__":
    serve(app, port=42069)
