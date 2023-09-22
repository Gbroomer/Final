#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc


# Local imports
from app import app
from models import db, User, Char, Class, Ability, Class_Ability_Association, Inventory, Treasure, Monster, Environment, Monster_Ability_Association, Monster_Environment_Association, Save

if __name__ == '__main__':
    with app.app_context():
        print("Deleting old data...")
        User.query.delete()
        Char.query.delete()
        Class.query.delete()
        Ability.query.delete()
        Class_Ability_Association.query.delete()
        Inventory.query.delete()
        Treasure.query.delete()
        Monster.query.delete()
        Environment.query.delete()
        Monster_Environment_Association.query.delete()
        Monster_Ability_Association.query.delete()
        Save.query.delete()
        db.session.commit()
        print('deleted all DB entries, starting seed...')

        ################################################################
        print('Creating Treasures')
        sword = Treasure(
            name = 'Worn Arming Sword', 
            description = 'A worn down thing, No amount of sharpening will restore its edge.', 
            type = 'wep',
            consumable_effect = 'none',
            consumable_potency = 0,
            stat_buff = 'none',
            stat_potency = 0,
            reduction = False,
            damage_reduction = 0,
            boost = True,
            damage_boost = 2,
            level = 1,
            cost = 5,
        )
        chain = Treasure(
            name = 'Worn Chainmail',
            description = 'A beaten up set of chainmail. Even with a good sand polishing, the rust would remain.',
            type = 'arm',
            consumable_effect = 'none',
            consumable_potency = 0,
            stat_buff = 'none',
            stat_potency = 0,
            reduction = True,
            damage_reduction = 3,
            boost = False,
            damage_boost = 0,
            level = 3,
            cost = 5,
        )
        dagger = Treasure(
            name = 'Rusted Dagger', 
            description = "A pitiful little thing. Careful around wounds and not to nick yourself.", 
            type = 'wep',
            consumable_effect = 'none',
            consumable_potency = 0,
            stat_buff = 'none',
            stat_potency = 0,
            reduction = False,
            damage_reduction = 0,
            boost = True,
            damage_boost = 1,
            level = 1,
            cost = 2,
        )
        rags = Treasure(
            name = 'Tattered Rags',
            description = 'A pitiful set of rags that hardly count as clothing.',
            type = 'arm',
            consumable_effect = 'none',
            consumable_potency = 0,
            stat_buff = 'none',
            stat_potency = 0,
            reduction = True,
            damage_reduction = 1,
            boost = False,
            damage_boost = 0,
            level = 1,
            cost = 2,
        )
        healing_pot= Treasure(
            name = 'Lesser Healing Potion',
            description = 'A minor refreshment. Will slightly restore your health.',
            type = "consume",
            consumable_effect = 'heal',
            consumable_potency = 10,
            stat_buff = 'none',
            stat_potency = 0,
            reduction = False,
            damage_reduction = 0,
            boost = False,
            damage_boost = 0,
            level = 1,
            cost = 10,
        )
        mana_pot = Treasure(
            name = 'Lesser Mana Potion',
            description = 'A minor refreshment. Will slightly restore your mana.',
            type = 'consume',
            consumable_effect = 'mana',
            consumable_potency = 12,
            stat_buff = 'none',
            stat_potency = 0,
            reduction = False,
            damage_reduction = 0,
            boost = False,
            damage_boost = 0,
            level = 1,
            cost = 15,
        )
        axe = Treasure(
            name = 'Hand Axe',
            description = 'A decent substitute for a proper weapon. Will definitely be useful to chop wood with',
            type = 'wep',
            consumable_effect = 'none',
            consumable_potency = 0,
            stat_buff = 'none',
            stat_potency = 0,
            reduction = False,
            damage_reduction = 0,
            boost = True,
            damage_boost = 4,
            level = 3,
            cost = 20,
        )
        
        items = [dagger, rags, sword, chain, healing_pot, mana_pot, axe]
        db.session.add_all(items)
        db.session.commit()
        
        ################################################################
        print('Creating Classes...')
        barbarian = Class(
            class_name = 'Barbarian',
            str_growth = 5,
            agi_growth = 3,
            con_growth = 6,
            mag_growth = 1,
            res_growth = 2,
            spd_growth = 3,
            hp_growth = 11,
            mp_growth = 4
        )
        
        cleric = Class(
            class_name = 'Cleric',
            str_growth = 4,
            agi_growth = 1,
            con_growth = 3,
            mag_growth = 5,
            res_growth = 6,
            spd_growth = 1,
            hp_growth = 8,
            mp_growth = 7
        )
        
        evoker = Class(
            class_name = 'Evoker',
            str_growth = 1,
            agi_growth = 3,
            con_growth = 2,
            mag_growth = 6,
            res_growth = 5,
            spd_growth = 3,
            hp_growth = 6,
            mp_growth = 9
        )
        
        thief = Class(
            class_name = 'Thief',
            str_growth = 2,
            agi_growth = 5,
            con_growth = 3,
            mag_growth = 2,
            res_growth = 2,
            spd_growth = 6,
            hp_growth = 9,
            mp_growth = 6
        )
        
        classes = [barbarian, cleric, evoker, thief]
        db.session.add_all(classes)
        db.session.commit()
        
        ################################################################
        print('Creating Abilities...')
        abilities = {
            'heal': Ability(
                name = 'Lesser Heal',
                cost = 4,
                status_effect = True, 
                effect_hostile = False,
                effect_version = 'Heal',
                effect_type = 'None',
                effect_range = 1,
                effect_ability = 'mag',
                effect_power = 4,
                damaging = False,
                level_req = 1
            ),
            'fireBolt': Ability(
                name = 'Firebolt',
                cost = 5,
                effect_version = 'Spell',
                damaging = True,
                damage_type = 'Magical',
                damage_range = 1,
                damage_ability = 'mag',
                damage_bonus = 5,
                level_req = 1
            ),
            'pound': Ability(
                name = 'Pound',
                cost = 6,
                status_effect = True,
                effect_hostile = True,
                effect_version = 'Stun',
                effect_type = 'Physical',
                effect_ability = 'str',
                effect_power = 3,
                damaging = True,
                damage_type = 'Physical',
                damage_range = 1,
                damage_ability = 'str',
                damage_bonus = 8,
                level_req = 1,
            ),
            'garrote': Ability(
                name = 'garrote',
                cost = 5,
                status_effect = True,
                effect_hostile = True,
                effect_version = 'Bleed',
                effect_type = 'Physical',
                effect_power = 5,
                effect_ability = 'agi',
                effect_duration = 2,
                damaging = True,
                damage_type = 'Physical',
                damage_range = 1,
                damage_ability = 'agi',
                damage_bonus = 5,
                level_req = 1,
            ),
        }
        
        db.session.add_all(list(abilities.values()))
        db.session.commit()
        ability_list = Ability.query.all()
        ################################################################
        print('Creating Ability Associations...')
        ability_associations = {
            'cleric_heal': Class_Ability_Association(
                class_id = cleric.id,
                ability_id = ability_list[0].id
            ),
            'evoker_firebolt': Class_Ability_Association(
                class_id = evoker.id,
                ability_id = ability_list[1].id
            ),
            'barbarian_pound': Class_Ability_Association(
                class_id = barbarian.id,
                ability_id = ability_list[2].id
            ),
            'thief_garrote': Class_Ability_Association(
                class_id = thief.id,
                ability_id = ability_list[3].id
            )
        }
        
        db.session.add_all(list(ability_associations.values()))
        db.session.commit()
        ################################################################
        print('Creating Monsters...')
        monsters = {
            'goblin': Monster(
                name = 'Goblin',
                img_url = "https://www.dndbeyond.com/avatars/thumbnails/30783/955/1000/1000/638062024584880857.png",
                hp = 10,
                mp = 10,
                str = 12,
                agi = 17,
                con = 14,
                mag = 10,
                res = 9,
                spd = 16,
                exp = 1,
                lvl = 1,
                gold = 8,
                damage_type = 'Physical',
                damage_ability = 'agi',
                damage_range = 6
            ),
            'treeman' : Monster(
                name = 'Tree Man',
                img_url = "https://www.dndbeyond.com/avatars/thumbnails/36576/553/1000/1000/638291908477327963.png",
                hp = 14,
                mp = 14,
                str = 19,
                agi = 15,
                con = 19,
                mag = 15,
                res = 14,
                spd = 14,
                exp = 4,
                lvl = 3,
                gold = 9,
                damage_type = 'Physical',
                damage_ability = 'str',
                damage_range = 10
            ),
            'skeleton': Monster(
                name = 'Skeleton',
                img_url = "https://www.dndbeyond.com/avatars/thumbnails/30835/849/1000/1000/638063922565505819.png",
                hp = 18,
                mp = 17,
                str = 19,
                agi = 24,
                con = 17,
                mag = 19,
                res = 13,
                spd = 12,
                exp = 6,
                lvl = 4,
                gold = 11,
                damage_type = 'Physical',
                damage_ability = 'str',
                damage_range = 12
            ),
            'orc': Monster(
                name = 'Orc',
                img_url = "https://www.dndbeyond.com/avatars/thumbnails/30834/160/1000/1000/638063882785865067.png",
                hp = 28,
                mp = 14,
                str = 24,
                agi = 20,
                con = 25,
                mag = 17,
                res = 14,
                spd = 22,
                exp = 12,
                lvl = 6,
                gold = 18,
                damage_type = 'Physical',
                damage_ability = 'str',
                damage_range = 15
            ),
            'bandit': Monster(
                name = 'Bandit',
                img_url = "https://www.dndbeyond.com/avatars/thumbnails/30849/318/1000/1000/638064499691067109.png",
                hp = 36,
                mp = 14,
                str = 28,
                agi = 25,
                con = 21,
                mag = 25,
                res = 22,
                spd = 28,
                exp = 16,
                lvl = 9,
                gold = 23,
                damage_type = 'Physical',
                damage_ability = 'str',
                damage_range = 19
            ),
            'ankheg': Monster(
                name = 'Ankheg',
                img_url = 'https://www.dndbeyond.com/avatars/thumbnails/30761/865/1000/1000/638061096692582271.png',
                hp = 52,
                mp = 26,
                str = 36,
                agi = 33,
                con = 30,
                mag = 32,
                res = 23,
                spd = 34,
                exp = 22,
                lvl = 11,
                gold = 32,
                damage_type = 'Physical',
                damage_ability = 'str',
                damage_range = 23
            ),
            'owlbear': Monster(
                name = "Owlbear",
                img_url = 'https://www.dndbeyond.com/avatars/thumbnails/30834/185/1000/1000/638063883093825018.png',
                hp = 78,
                mp = 43,
                str = 47,
                agi = 39,
                con = 50,
                mag = 37,
                res = 41,
                spd = 44,
                exp = 35,
                lvl = 14,
                gold = 23,
                damage_type = 'Physical',
                damage_ability = 'str',
                damage_range = 29
            )
        }
        
        db.session.add_all(list(monsters.values()))
        db.session.commit()
        
        #################################################################
        print('Creating Environments...')
        environments = {
            'forrest': Environment(
                name = 'Forrest',
                description = 'A lush, green woodlands full of monster and serenity.',
                img_url = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e2fc94a7-cb0b-422a-9579-5921f6b17da9/d4bkb17-8e7eda09-2b22-4953-b672-96012e314a62.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2UyZmM5NGE3LWNiMGItNDIyYS05NTc5LTU5MjFmNmIxN2RhOVwvZDRia2IxNy04ZTdlZGEwOS0yYjIyLTQ5NTMtYjY3Mi05NjAxMmUzMTRhNjIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.c1NZwIn1BiQ-ksgE9N_ev6REar-YK1yAz4bJyK0wa5Q'
            )
        }
        db.session.add_all(list(environments.values()))
        db.session.commit()
        monster_list=Monster.query.all()
        environment_list=Environment.query.all()
        ################################################################
        print('Creating Monster Environment Associations...')
        monster_environments = {
            'goblin_forrest': Monster_Environment_Association(
                monster_id = monster_list[0].id,
                environment_id = environment_list[0].id
            ),
            'treeman_forrest': Monster_Environment_Association(
                monster_id = monster_list[1].id,
                environment_id = environment_list[0].id
            ),
            'skeleton_forrest': Monster_Environment_Association(
                monster_id = monster_list[2].id,
                environment_id = environment_list[0].id
            ),
            'orc_forrest': Monster_Environment_Association(
                monster_id = monster_list[3].id,
                environment_id = environment_list[0].id
            ),
            'bandit_forrest': Monster_Environment_Association(
                monster_id = monster_list[4].id,
                environment_id = environment_list[0].id
            ),
            'ankheg_forrest': Monster_Environment_Association(
                monster_id = monster_list[5].id,
                environment_id = environment_list[0].id
            ),
            'owlbear_forrest': Monster_Environment_Association(
                monster_id = monster_list[6].id,
                environment_id = environment_list[0].id
            ),
        }
        db.session.add_all(list(monster_environments.values()))
        db.session.commit()
        
        ################################################################
        print('Creating Monster Ability Associations...')
        monster_abilities = {
            'goblin_heal': Monster_Ability_Association(
                monster_id = monster_list[0].id,
                ability_id = ability_list[0].id
            )
        }
        
        db.session.add_all(list(monster_abilities.values()))
        db.session.commit()
        
        ################################################################
        print('Creating Characters...') 
        characters = {
            'Test_Barbarian': Char(
                char_name = 'Test Barbarian',
                char_class = barbarian.id,
                str = 10,
                agi = 10,
                con = 10,
                mag = 10,
                res = 10,
                spd = 10,
                current_hp = 10,
                max_hp = 10,
                current_mp = 10,
                max_mp = 10,
                wep_id = dagger.id,
                arm_id = rags.id
            ),
            'Test_Cleric': Char(
                char_name = 'Test Cleric',
                char_class = cleric.id,
                str = 10,
                agi = 10,
                con = 10,
                mag = 10,
                res = 10,
                spd = 10,
                current_hp = 10,
                max_hp = 10,
                current_mp = 10,
                max_mp = 10,
                wep_id = dagger.id,
                arm_id = rags.id
            ),
            'Test_Evoker': Char(
                char_name = 'Test 1',
                char_class = evoker.id,
                str = 10,
                agi = 10,
                con = 10,
                mag = 10,
                res = 10,
                spd = 10,
                current_hp = 10,
                max_hp = 10,
                current_mp = 10,
                max_mp = 10,
                wep_id = dagger.id,
                arm_id = rags.id
            ),
            'Test_Thief': Char(
                char_name = 'Test Thief',
                char_class = thief.id,
                str = 10,
                agi = 10,
                con = 10,
                mag = 10,
                res = 10,
                spd = 10,
                current_hp = 10,
                max_hp = 10,
                current_mp = 10,
                max_mp = 10,
                wep_id = dagger.id,
                arm_id = rags.id
            )
        }
        
        db.session.add_all(list(characters.values()))
        db.session.commit()
        character_list = Char.query.all()
        ################################################################
        print('Creating Users...')
        user1 = User(
            username = 'user1', 
            password='Password#1',
            char_1 = barbarian.id,
            char_2 = cleric.id,
            char_3 = evoker.id,
            char_4 = thief.id,
            )
        
        db.session.add(user1)
        db.session.commit()
        
        ################################################################
        print('Creating Inventories')
        inventory = Inventory(
            user_id = user1.id,
            slot_1 = sword.id,
            slot_2 = chain.id,
            slot_3 = healing_pot.id,
            slot_4 = mana_pot.id,
        )
        db.session.add(inventory)
        db.session.commit()
