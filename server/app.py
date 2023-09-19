#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, Flask, jsonify, make_response
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Char, Class, Ability, Class_Ability_Association, Inventory, Treasure, Monster, Environment, Monster_Ability_Association, Monster_Environment_Association, Save

# Views go here!

@app.route('/')
def index():
    return '<h1>Phase 4 Project Server</h1>'

################################################################
class Users(Resource):
    def get(self):
        users = [user.to_dict(rules=('-created_at', '-updated_at', '-char1', '-char2', '-char3', '-char4', '-inv', '-lvl', '-xp',)) for user in User.query.all()]
        return make_response(jsonify(users), 200)
    def post(self):
        data = request.get_json(force=True)
        try:
            
            new_user = User(**data)
            db.session.add(new_user)
            db.session.commit()
            return make_response(jsonify(new_user.to_dict()), 201)
        
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)
        
api.add_resource(Users, '/users')

################################################################

class UsersById(Resource):
    def get(self, id):
        user = User.query.filter_by(id=id).first()
        if not user:
            return make_response(jsonify({'errror': 'User not found'}), 404)
        return make_response(jsonify(user.to_dict()), 200)
    
    def patch(self):
        data = request.get_json(force=True)
        user = User.query.filter_by(id=data['id']).first()
        try:
            for key, value in data.items():
                setattr(user, key, value)
            db.session.commit()
            return make_response(jsonify(user.to_dict()), 200)
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)
        
    def delete(self):
        data = request.get_json(force=True)
        user = User.query.filter_by(id=data['id']).first()
        try:
            db.session.delete(user)
            db.session.commit()
            return make_response(jsonify(user.to_dict()), 200)
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)

api.add_resource(UsersById, '/users/<int:id>')

###################################################################

class Chars(Resource):
    
    def get(self):
        chars = [char.to_dict() for char in Char.query.all()]
        return make_response(jsonify(chars), 200)
    def post(self):
        data = request.get_json(force=True)
        try:
            
            new_char = Char(**data)
            db.session.add(new_char)
            db.session.commit()
            return make_response(jsonify(new_char.to_dict()), 201)
        
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)
api.add_resource(Chars, '/chars')

###################################################################
class CharsById(Resource):
    def get(self, id):
        char = Char.query.filter_by(id=id).first()
        if not char:
            return make_response(jsonify({'errror': 'Character not found'}), 404)
        return make_response(jsonify(char.to_dict()), 200)
    
    def patch(self):
        data = request.get_json(force=True)
        char = Char.query.filter_by(id=data['id']).first()
        try:
            for key, value in data.items():
                setattr(char, key, value)
            db.session.commit()
            return make_response(jsonify(char.to_dict()), 200)
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)
        
    def delete(self):
        data = request.get_json(force=True)
        char = Char.query.filter_by(id=data['id']).first()
        try:
            db.session.delete(char)
            db.session.commit()
            return make_response({'Sucessfully deleted User.'}, 200)
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)
api.add_resource(CharsById, '/chars/<int:id>')
        
# ################################################################
class Classes(Resource):
    def get(self):
        classes = [char_class.to_dict() for char_class in Class.query.all()]
        return make_response(jsonify(classes), 200)
api.add_resource(Classes, '/classes')

################################################################

class Abilities(Resource):
    def get(self):
        abilities = [ability.to_dict() for ability in Ability.query.all()]
        return make_response(jsonify(abilities), 200)
api.add_resource(Abilities, '/abilities')

#################################################################

class ClassAbilityAssociations(Resource):
    def get(self):
        ability_associations = [ability_association.to_dict() for ability_association in Ability.query.all()]
        return make_response(jsonify(ability_associations), 200)
api.add_resource(ClassAbilityAssociations, '/class_abilities')

#################################################################

class Inventories(Resource):
    def get(self):
        inventories = [inventory.to_dict() for inventory in Inventory.query.all()]
        return make_response(jsonify(inventories), 200)
    def post(self):
        user_id = request.args.get('user_id')
        try:
            new_inventory = User(user_id = user_id)
            db.session.add(new_inventory)
            db.session.commit()
            return make_response(jsonify(new_inventory.to_dict()), 201)
        
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)
    def patch(self):
        data = request.get_json(force=True)
        inventory = Inventory.query.filter_by(id=data['id']).first()
        try:
            for key, value in data.items():
                setattr(inventory, key, value)
            db.session.commit()
            return make_response(jsonify(inventory.to_dict()), 200)
        except ValueError as e:
            return make_response(jsonify({'error': str(e)}), 400)
api.add_resource(Inventories, '/inventories')

###################################################################

class Monsters(Resource):
    def get(self):
        monsters = [monster.to_dict() for monster in Monster.query.all()]
        return make_response(jsonify(monsters), 200)
api.add_resource(Monsters, '/monsters')

###################################################################
class Treasures(Resource):
    def get(self):
        treasures = [treasure.to_dict() for treasure in Treasures.query.all()]
        return make_response(jsonify(treasures), 200)
api.add_resource(Treasures, '/treasures')

###################################################################

class Environments(Resource):
    def get(self):
        environments = [environment.to_dict() for environment in Environment.query.all()]
        return make_response(jsonify(environments), 200)
api.add_resource(Environments, '/environments')

###################################################################

if __name__ == '__main__':
    app.run(port=5555, debug=True)

