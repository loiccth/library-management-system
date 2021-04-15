from lightfm import LightFM
from lightfm.data import Dataset
from lightfm.evaluation import precision_at_k
from lightfm.evaluation import auc_score
from lightfm.cross_validation import random_train_test_split
import numpy as np
import pickle
import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

client = pymongo.MongoClient(os.getenv('ATLAS_URI'))
db = client["library"]
members = db["members"]
udm = db["udm"]
books = db["books"]
transactions = db["transactions"]

user_feature = []
for x in members.find({}, {"_id": 1, "udmid": 1}):
    temp = udm.find_one({"_id": x["udmid"]}, {"course": 1, "campus": 1})
    if "course" in temp:
        user_feature.append(
            {"userid": str(x["_id"]), "course": temp["course"], "campus": temp["campus"]})
    else:
        user_feature.append(
            {"userid": str(x["_id"]), "course": "", "campus": temp["campus"]})

book_feature = []
for x in books.find({}, {"isbn": 1, "author": 1, "category": 1, "campus": 1}):
    book_feature.append(
        {"isbn": x["isbn"], "author": ",".join(x["author"]), "category": x["category"], "campus": x["campus"]})

rating = []
for x in transactions.find({}, {"userid": 1, "bookid": 1}):
    temp = books.find_one({"_id": x["bookid"]}, {"isbn": 1})
    rating.append({"userid": str(x["userid"]), "isbn": temp["isbn"]})

# Create a user dictionary
user_dict = {}
counter = 0
for i in user_feature:
    user_dict[i['userid']] = counter
    counter += 1

# Create an item dictionary
item_dict = []
for i in book_feature:
    item_dict.append(i['isbn'])
item_dict = np.array(item_dict)

dataset = Dataset()
dataset.fit((x['userid'] for x in rating),
            (x['isbn'] for x in rating))

num_users, num_items = dataset.interactions_shape()
print('Num users: {}, Num items {}.'.format(num_users, num_items))

dataset.fit(users=(x['userid'] for x in user_feature),
            items=(x['isbn'] for x in book_feature),
            item_features=(list(x['category'] for x in book_feature) +
                           list(x['author'] for x in book_feature) +
                           list(x['campus'] for x in book_feature)),
            user_features=(list(x['course'] for x in user_feature) +
                           list(x['campus'] for x in user_feature)))

(interactions, weights) = dataset.build_interactions(((x['userid'], x['isbn'])
                                                      for x in rating))

item_features = dataset.build_item_features(((x['isbn'], [x['category'], x['author'], x['campus']])
                                             for x in book_feature))

user_features = dataset.build_user_features(((x['userid'], [x['course'], x['campus']])
                                             for x in user_feature))

model = LightFM(loss='warp')

(train, test) = random_train_test_split(
    interactions=interactions, test_percentage=0.2)

model.fit(train, item_features=item_features,
          user_features=user_features, epochs=10)

# model performnce evaluation
train_precision = precision_at_k(
    model, train, item_features=item_features, user_features=user_features, k=10).mean()
test_precision = precision_at_k(
    model, test, item_features=item_features, user_features=user_features, k=10).mean()

train_auc = auc_score(model, train, item_features=item_features,
                      user_features=user_features).mean()
test_auc = auc_score(model, test, item_features=item_features,
                     user_features=user_features).mean()

print('Precision: train %.2f, test %.2f.' % (train_precision, test_precision))
print('AUC: train %.2f, test %.2f.' % (train_auc, test_auc))

pickle.dump(model, open('model.pickle', 'wb'))
pickle.dump(interactions, open('interactions.pickle', 'wb'))
pickle.dump(item_features, open('item_features.pickle', 'wb'))
pickle.dump(user_features, open('user_features.pickle', 'wb'))
pickle.dump(user_dict, open('user_dict.pickle', 'wb'))
pickle.dump(item_dict, open('item_dict.pickle', 'wb'))
