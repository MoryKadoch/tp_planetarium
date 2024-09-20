from flask import Flask, redirect, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from flask_kafka import FlaskKafka
from flask_cors import CORS

app = Flask(__name__)
app.config["KAFKA_CONFIG"] = {
  'bootstrap.servers': 'localhost:9092',
  'group.id': 'planets',
  'enable.auto.commit': 'false',
  'auto.offset.reset': 'earliest'
}

CORS(app)  # Autoriser les requêtes provenant de n'importe quelle origine (ou configurer précisément les origines autorisées)
bus = FlaskKafka()
bus.init_app(app)

client = MongoClient('mongodb://localhost:27017/')  # Remplace par l'URL de ton MongoDB
db = client.planetarium_db
planets_collection = db.planets

@app.route('/')
def redirectToHome():
  return redirect("/api", code=302)


@app.route('/api', methods=['GET'])
def home():
  return "Welcome to Planetarium API !"


@app.route('/api/planets', methods=['GET'])
def get_planets():
  try:
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    offset = (page - 1) * limit
    planets_cursor = planets_collection.find().sort('_id', -1).skip(offset).limit(limit)
    planets = list(planets_cursor)

    for planet in planets:
      planet['_id'] = str(planet['_id'])

    return jsonify(planets), 200
  
  except Exception as e:
    return jsonify({ "error": str(e) }), 500


@app.route('/api/planet', methods=['GET', 'POST'])
def add_planet():
  if request.method == 'GET':
    try:
      planet_id = request.args.get('id')
      planet_name = request.args.get('name')

      query = {}

      if planet_id:
        try:
          query['_id'] = ObjectId(planet_id)

        except Exception:
          return jsonify  ({ "error": "ID invalide." }), 400
      elif planet_name:
        query['Name'] = planet_name
      else:
        return jsonify({ "error": "Vous devez fournir soit un ID, soit un nom." }), 400
      
      print(query)
      
      planet = planets_collection.find_one(query)

      if planet:
        planet['_id'] = str(planet['_id'])
        return jsonify(planet), 200 
      else:
        return jsonify({ "error": "Planète non trouvée." }), 404
    
    except Exception as e:
      return jsonify({ "error": str(e) }), 500
    
  elif request.method == 'POST':
    try:
      data = request.get_json()

      required_fields = {
        'Name': str,
        'Num_Moons': int,
        'Minerals': int,
        'Gravity': float,
        'Sunlight_Hours': float,
        'Temperature': float,
        'Rotation_Time': float,
        'Water_Presence': bool,
        'Colonisable': bool
      }

      for field, field_type in required_fields.items():
        if field not in data:
            return jsonify({ "error": f"Le champ '{field}' est manquant." }), 400
        if not isinstance(data[field], field_type):
            return jsonify({ "error": f"Le champ '{field}' doit être de type {field_type.__name__}." }), 400
      
      existing_planet = planets_collection.find_one({"Name": data['Name']})
      if existing_planet:
        return jsonify({ "error": "Une planète avec ce nom existe déjà." }), 400
      
      new_planet = {
        'Name': data['Name'],
        'Num_Moons': data['Num_Moons'],
        'Minerals': data['Minerals'],
        'Gravity': data['Gravity'],
        'Sunlight_Hours': data['Sunlight_Hours'],
        'Temperature': data['Temperature'],
        'Rotation_Time': data['Rotation_Time'],
        'Water_Presence': data['Water_Presence'],
        'Colonisable': data['Colonisable']
      }

      result = planets_collection.insert_one(new_planet)

      return jsonify({
          "message": "Nouvelle planète ajoutée avec succès.",
          "planet": { **new_planet, "_id": str(result.inserted_id) }
      }), 201
    
    except Exception as e:
      return jsonify({ "error": str(e) }), 500
    

@app.route('/api/planet/<planet_id>', methods=['PUT', 'DELETE'])
def update_planet(planet_id):
  if request.method == 'PUT':
    try:
      data = request.get_json()

      try:
        planet_id_obj = ObjectId(planet_id)
      except Exception:
        return jsonify({"error": "ID invalide."}), 400
      
      existing_planet = planets_collection.find_one({ "_id": planet_id_obj })

      if not existing_planet:
        return jsonify({"error": "Planète non trouvée."}), 404
      
      if "Name" in data and data["Name"] != existing_planet["Name"]:
        duplicate_planet = planets_collection.find_one({"Name": data["Name"]})

        if duplicate_planet:
          return jsonify({ "error": "Une planète avec ce nom existe déjà." }), 400
      
      update_fields = {}

      for field in ['Name', 'Num_Moons', 'Minerals', 'Gravity', 'Sunlight_Hours', 'Temperature', 'Rotation_Time', 'Water_Presence', 'Colonisable']:
        if field in data:
          update_fields[field] = data[field]
      
      if not update_fields:
        return jsonify({"error": "Aucun champ valide à mettre à jour."}), 400
      
      updated_planet = planets_collection.update_one(
        { "_id": planet_id_obj },
        { "$set": update_fields }
      )

      updated_planet = planets_collection.find_one({ "_id": planet_id_obj })
      updated_planet['_id'] = str(updated_planet['_id'])

      return jsonify({ "message": "Planète mise à jour avec succès.", "planet": updated_planet }), 200
    except Exception as e:
      return jsonify({"error": str(e)}), 500
  
  elif request.method == 'DELETE':
    try:
      try:
        planet_id_obj = ObjectId(planet_id)
      except Exception:
        return jsonify({ "error": "ID invalide." }), 400
      
      planet = planets_collection.find_one({"_id": planet_id_obj})

      if not planet:
        return jsonify({ "error": "Planète non trouvée." }), 404

      planets_collection.delete_one({ "_id": planet_id_obj })

      return jsonify({"message": "Planète supprimée avec succès."}), 200
    except Exception as e:
      return jsonify({"error": str(e)}), 500


# @app.route('/api/planets/update_colonisable', methods=['PUT'])
# def update_all_colonisable():
#   try:
#     result = planets_collection.update_many(
#       {},
#       [
#         {
#           "$set": {
#             "Colonisable": {
#               "$cond": {
#                 "if": {"$eq": ["$Colonisable", 1]},
#                 "then": True,
#                 "else": False
#               }
#             },
#             "Water_Presence": {
#               "$cond": {
#                 "if": {"$eq": ["$Water_Presence", 1]},
#                 "then": True,
#                 "else": False
#               }
#             }
#           }
#         }
#       ]
#     )
    
#     return jsonify({
#       "message": "Tous les documents ont été mis à jour.",
#       "matched_count": result.matched_count,
#       "modified_count": result.modified_count
#     }), 200
  
#   except Exception as e:
#     return jsonify({ "error" : str(e) }), 500

if __name__ == '__main__':
  app.run(debug=True)