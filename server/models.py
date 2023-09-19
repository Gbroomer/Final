from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
import re
from validate_email import validate_email
from datetime import datetime
from config import db

# Models go here!

class User(db.Model, SerializerMixin):
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default = datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default = datetime.now, onupdate=datetime.now)
    lvl = db.Column(db.Integer, default=1, nullable=False)
    xp = db.Column(db.Integer, default=0, nullable=False)
    char_1 = db.Column(db.Integer, db.ForeignKey('chars.id'))
    char_2 = db.Column(db.Integer, db.ForeignKey('chars.id'))
    char_3 = db.Column(db.Integer, db.ForeignKey('chars.id'))
    char_4 = db.Column(db.Integer, db.ForeignKey('chars.id'))
    
    char1 = db.relationship('Char', foreign_keys=[char_1])
    char2 = db.relationship('Char', foreign_keys=[char_2])
    char3 = db.relationship('Char', foreign_keys=[char_3])
    char4 = db.relationship('Char', foreign_keys=[char_4])
    inv = db.relationship('Inventory', backref = 'user', cascade = 'all, delete-orphan')
    
    serialize_only = ('username', 'password', 'char1', 'char2', 'char3', 'char4', 'inv', 'lvl', 'xp', 'id',)
    # serialize_rules = ('-char1.', '-char2_slot', '-char3_slot', '-char4_slot', '-inventory')
    
    @validates('username')
    def validate_username(self, key, username):
        if User.query.filter_by(username=username).first():
            raise ValueError('Username Already Exists')
        return username
    
        
class Char(db.Model, SerializerMixin):
    
    __tablename__ = 'chars'
    
    id = db.Column(db.Integer, primary_key=True)
    char_name = db.Column(db.String(20), nullable=False)
    char_class = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False,)
    str = db.Column(db.Integer, nullable=False)
    agi = db.Column(db.Integer, nullable=False)
    con = db.Column(db.Integer, nullable=False)
    mag = db.Column(db.Integer, nullable=False)
    res = db.Column(db.Integer, nullable=False)
    spd = db.Column(db.Integer, nullable=False)
    current_hp = db.Column(db.Integer, nullable=False)
    max_hp = db.Column(db.Integer, nullable=False)
    current_mp = db.Column(db.Integer, nullable=False)
    max_mp = db.Column(db.Integer, nullable=False)
    wep_id = db.Column(db.Integer, db.ForeignKey('treasures.id'), nullable = False)
    arm_id = db.Column(db.Integer, db.ForeignKey('treasures.id'), nullable = False)

    char1_slot = db.relationship('User', backref='char1_slot', foreign_keys=[User.char_1], lazy='dynamic')
    char2_slot = db.relationship('User', backref='char2_slot', foreign_keys=[User.char_2], lazy='dynamic')
    char3_slot = db.relationship('User', backref='char3_slot', foreign_keys=[User.char_3], lazy='dynamic')
    char4_slot = db.relationship('User', backref='char4_slot', foreign_keys=[User.char_4], lazy='dynamic')
    weapon = db.relationship('Treasure', foreign_keys=[wep_id], )
    armor = db.relationship('Treasure', foreign_keys=[arm_id], )
    character_class = db.relationship('Class', foreign_keys=[char_class],)
    
    serialize_only = ('char_name', 'character_class', 'str', 'agi', 'con', 'mag', 'res', 'spd', 'current_hp', 'max_hp', 'current_mp', 'max_mp', 'weapon', 'armor', 'id',)
    # serialize_rules = ('-char1_slot.char1_slot', '-char2_slot.char2_slot', '-char3_slot.char3_slot', '-char4_slot.char4_slot',)
    # serialize_rules = ('-weapon_treasure.weapon_chars', '-treasure.armor_chars', '-char1_slot', '-char2_slot', '-char3_slot',)

class Class(db.Model, SerializerMixin):
    
    __tablename__ = 'classes'
    
    id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String, nullable = False) 
    str_growth = db.Column(db.Integer, nullable = False) ## Value added to STR of character (below is the same)
    agi_growth = db.Column(db.Integer, nullable = False)
    con_growth = db.Column(db.Integer, nullable = False)
    mag_growth = db.Column(db.Integer, nullable = False)
    res_growth = db.Column(db.Integer, nullable = False)
    spd_growth = db.Column(db.Integer, nullable = False)
    hp_growth = db.Column(db.Integer, nullable = False)
    mp_growth = db.Column(db.Integer, nullable = False)
    
    abilities = db.relationship("Class_Ability_Association", backref='class', lazy='dynamic')
    chars = db.relationship('Char', backref='class', lazy='dynamic')
    
    serialize_only = ('class_name', 'str_growth', 'agi_growth', 'con_growth', 'mag_growth', 'res_growth', 'spd_growth', 'hp_growth', 'mp_growth', 'abilities', 'id',)
    
class Ability(db.Model, SerializerMixin):
    
    __tablename__ = 'abilities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    cost = db.Column(db.Integer, default=0)
    status_effect = db.Column(db.Boolean, default=False) ## checks if the ability has an effect
    effect_hostile = db.Column(db.Boolean, default=True) ## checks if the ability targets a friend or enemy
    effect_version = db.Column(db.String, default='None') ## Sweep, Buff, Heal, Debuff, Stun
    effect_type = db.Column(db.String, default='None') ## Magical, Physical for determining resistances if applicable
    effect_range = db.Column(db.Integer, default= 0 ) ## determines number of targets
    effect_ability = db.Column(db.String, default='None') # determines ability used/buffed/debuffed
    effect_power = db.Column(db.Integer, default = 0) ## determines value of effect (buff, heal, debuff)
    damaging = db.Column(db.Boolean, default=True) ## checks if the ability deals damage
    damage_type = db.Column(db.String, default='Physical') ## Magical, Physical for determining resistances if applicable
    damage_range = db.Column(db.Integer, default=1) ## Range of additional damage dealt. Can be negative or positive.
    damage_ability = db.Column(db.String, default="str") ## determines ability used for damage
    damage_bonus = db.Column(db.Integer, default=0)
    level_req = db.Column(db.Integer, default=1) ## Check for the level of the ability to be learned by the class.
    
    classes = db.relationship('Class_Ability_Association', backref='ability', lazy='dynamic')
    monsters = db.relationship('Monster_Ability_Association', backref='ability', lazy='dynamic')
    
    serialize_only = ('name', 'cost', 'status_effect', 'effect_hostile', 'effect_version', 'effect_type', 'effect_range', 'effect_ability', 'effect_power', 'damaging', 'damage_type', 'damage_range', 'damage_ability', 'damage_bonus', 'level_req')
    
class Class_Ability_Association(db.Model, SerializerMixin):
    
    __tablename__ = "class_ability_associations"
    
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    ability_id = db.Column(db.Integer, db.ForeignKey('abilities.id'), nullable=False)
    
    serialize_rules = ('-class', '-id', '-class_id', '-ability_id',)
class Inventory(db.Model, SerializerMixin):
    
    __tablename__ = 'inventories'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    slot_1 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_2 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_3 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_4 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_5 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_6 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_7 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_8 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_9 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    slot_10 = db.Column(db.Integer, db.ForeignKey('treasures.id'))
    
    users = db.relationship('User', backref='inventory',)
    
    slot_1_treasure = db.relationship('Treasure', foreign_keys=[slot_1])
    slot_2_treasure = db.relationship('Treasure', foreign_keys=[slot_2])
    slot_3_treasure = db.relationship('Treasure', foreign_keys=[slot_3])
    slot_4_treasure = db.relationship('Treasure', foreign_keys=[slot_4])
    slot_5_treasure = db.relationship('Treasure', foreign_keys=[slot_5])
    slot_6_treasure = db.relationship('Treasure', foreign_keys=[slot_6])
    slot_7_treasure = db.relationship('Treasure', foreign_keys=[slot_7])
    slot_8_treasure = db.relationship('Treasure', foreign_keys=[slot_8])
    slot_9_treasure = db.relationship('Treasure', foreign_keys=[slot_9])
    slot_10_treasure = db.relationship('Treasure', foreign_keys=[slot_10])
    
    serialize_only = ('slot_1_treasure', 'slot_2_treasure', 'slot_3_treasure', 'slot_4_treasure', 'slot_5_treasure', 'slot_6_treasure', 'slot_7_treasure', 'slot_8_treasure', 'slot_9_treasure', 'slot_10_treasure',)
    
    
    # serialize_rules = ('-treasures.inventories',)
    
class Treasure(db.Model, SerializerMixin):
    
    __tablename__ = 'treasures'
    
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String)
    description = db.Column(db.String)
    type = db.Column(db.String, default='wep') ##wep or arm
    consumable_effect = db.Column(db.String, default='none') ##none, heal, clense, spell
    consumable_potency = db.Column(db.Integer, default=0) ##total potency of heal if applicable
    stat_buff = db.Column(db.String, default='none') ##none, str, agi, con, mag, res, spd
    stat_potency = db.Column(db.Integer, default=1) ##total increase to stat
    reduction = db.Column(db.Boolean, default=False) ##check if damage reduction is enabled on item
    damage_reduction = db.Column(db.Integer, default=1) ##total damage reduction if applicable
    boost = db.Column(db.Boolean, default=False) ##check if damage bonus is enabled on item
    damage_boost = db.Column(db.Integer, default=1) ##total damage bonus if applicable
    level = db.Column(db.Integer, default = 1)
    
    weapons = db.relationship('Char', backref='weapon_treasure', foreign_keys=[Char.wep_id])
    armors = db.relationship('Char', backref='armor_treasure', foreign_keys=[Char.arm_id])
    inventories_slot_1 = db.relationship('Inventory', backref='treasure_slot_1', foreign_keys=[Inventory.slot_1])
    inventories_slot_2 = db.relationship('Inventory', backref='treasure_slot_2', foreign_keys=[Inventory.slot_2])
    inventories_slot_3 = db.relationship('Inventory', backref='treasure_slot_3', foreign_keys=[Inventory.slot_3])
    inventories_slot_4 = db.relationship('Inventory', backref='treasure_slot_4', foreign_keys=[Inventory.slot_4])
    inventories_slot_5 = db.relationship('Inventory', backref='treasure_slot_5', foreign_keys=[Inventory.slot_5])
    inventories_slot_6 = db.relationship('Inventory', backref='treasure_slot_6', foreign_keys=[Inventory.slot_6])
    inventories_slot_7 = db.relationship('Inventory', backref='treasure_slot_7', foreign_keys=[Inventory.slot_7])
    inventories_slot_8 = db.relationship('Inventory', backref='treasure_slot_8', foreign_keys=[Inventory.slot_8])
    inventories_slot_9 = db.relationship('Inventory', backref='treasure_slot_9', foreign_keys=[Inventory.slot_9])
    inventories_slot_10 = db.relationship('Inventory', backref='treasure_slot_10', foreign_keys=[Inventory.slot_10])
    
    
    serialize_only = ('name', 
                    'description', 
                    'type', 
                    'consumable_effect', 
                    'consumable_potency', 
                    'stat_buff', 
                    'stat_potency',
                    'reduction',
                    'damage_reduction', 
                    'boost',
                    'damage_boost',
                    'level',)

class Monster(db.Model, SerializerMixin):
    
    __tablename__ = 'monsters'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    img_url = db.Column(db.String)
    hp = db.Column(db.Integer, nullable=False)
    mp = db.Column(db.Integer, nullable=False)
    str = db.Column(db.Integer, nullable=False)
    agi = db.Column(db.Integer, nullable=False)
    con = db.Column(db.Integer, nullable=False)
    mag = db.Column(db.Integer, nullable=False)
    res = db.Column(db.Integer, nullable=False)
    spd = db.Column(db.Integer, nullable=False)
    exp = db.Column(db.Integer, nullable=False)
    lvl = db.Column(db.Integer, nullable=False)
    damage_type = db.Column(db.String, default='Physical', nullable=False) ##type of damage dealt with basic attacks
    damage_ability = db.Column(db.String, default='str', nullable=False) ##damage modified by stat
    damage_range = db.Column(db.Integer, default=1, nullable=False) ##standard range for damage calculations before modifiers
    
    abilities = db.relationship('Monster_Ability_Association', backref='monster', lazy='dynamic')
    environments = db.relationship('Monster_Environment_Association', backref='monster', lazy='dynamic')
    
    serialize_rules = ('-environments',)

class Environment(db.Model, SerializerMixin):
    
    __tablename__ = 'environment'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable = False)
    img_url = db.Column(db.String, nullable = False )
    
    monsters = db.relationship('Monster_Environment_Association', backref='environment', lazy='dynamic')
    
    serialize_only = ('name', 'description', 'img_url', 'monsters',)
    
class Monster_Environment_Association(db.Model, SerializerMixin):
    
    __tablename__ = 'monster_environment_associations'
    
    id = db.Column(db.Integer, primary_key=True)
    monster_id = db.Column(db.Integer, db.ForeignKey('monsters.id'))
    environment_id = db.Column(db.Integer, db.ForeignKey('environment.id'))
    
    serialize_rules = ('-environment_id', '-id', '-monster_id', '-environment')
    
class Monster_Ability_Association(db.Model, SerializerMixin):
    
    __tablename__ = 'monster_ability_associations'
    
    id = db.Column(db.Integer, primary_key=True)
    monster_id = db.Column(db.Integer, db.ForeignKey('monsters.id'))
    ability_id = db.Column(db.Integer, db.ForeignKey('abilities.id'))
    
    serialize_rules = ('-monster', '-id', '-class_id', '-ability_id', '-monster_id',)
    
class Save(db.Model, SerializerMixin):
    
    __tablename__  = 'saves'
    id = db.Column(db.Integer, primary_key=True)
    