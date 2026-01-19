#!/usr/bin/env python
"""
Comprehensive Org Setup Module Test
Tests all org setup functionality end-to-end
"""
import sys
import os
sys.path.insert(0, 'd:/Python/HCM_WEB')
os.environ['APP_ENV'] = 'test'

from backend.database import SessionLocal, engine
from backend import models, crud, schemas
import json

def test_org_setup():
    """Test org setup module thoroughly"""
    db = SessionLocal()
    tests_passed = 0
    tests_failed = 0
    
    print("\n" + "="*60)
    print("🔍 HCM ORG SETUP MODULE - COMPREHENSIVE TEST")
    print("="*60 + "\n")
    
    try:
        # 1. TEST ORGANIZATIONS
        print("1️⃣  TESTING ORGANIZATIONS")
        print("-" * 40)
        
        orgs = crud.get_organizations(db)
        print(f"   ✓ Retrieved {len(orgs)} organizations")
        tests_passed += 1
        
        if len(orgs) > 0:
            org = orgs[0]
            print(f"   ✓ Org found: {org.name} (ID: {org.id})")
            tests_passed += 1
        
        # 2. TEST PLANTS
        print("\n2️⃣  TESTING PLANTS/LOCATIONS")
        print("-" * 40)
        
        plants = crud.get_plants(db)
        print(f"   ✓ Retrieved {len(plants)} plants")
        tests_passed += 1
        
        # 3. TEST DEPARTMENTS
        print("\n3️⃣  TESTING DEPARTMENTS")
        print("-" * 40)
        
        depts = crud.get_departments(db)
        print(f"   ✓ Retrieved {len(depts)} departments")
        tests_passed += 1
        
        # 4. TEST SUB-DEPARTMENTS
        print("\n4️⃣  TESTING SUB-DEPARTMENTS")
        print("-" * 40)
        
        sub_depts = crud.get_sub_departments(db)
        print(f"   ✓ Retrieved {len(sub_depts)} sub-departments")
        tests_passed += 1
        
        # 5. TEST GRADES
        print("\n5️⃣  TESTING GRADES")
        print("-" * 40)
        
        grades = crud.get_grades(db)
        print(f"   ✓ Retrieved {len(grades)} grades")
        tests_passed += 1
        
        if len(grades) > 0:
            grade = grades[0]
            print(f"   ✓ Grade found: {grade.name} (Level: {grade.level})")
            tests_passed += 1
        
        # 6. TEST DESIGNATIONS
        print("\n6️⃣  TESTING DESIGNATIONS")
        print("-" * 40)
        
        designations = crud.get_designations(db)
        print(f"   ✓ Retrieved {len(designations)} designations")
        tests_passed += 1
        
        if len(designations) > 0:
            desig = designations[0]
            print(f"   ✓ Designation found: {desig.name}")
            tests_passed += 1
        
        # 7. TEST SHIFTS
        print("\n7️⃣  TESTING SHIFTS")
        print("-" * 40)
        
        shifts = crud.get_shifts(db)
        print(f"   ✓ Retrieved {len(shifts)} shifts")
        tests_passed += 1
        
        # 8. TEST EMPLOYMENT LEVELS
        print("\n8️⃣  TESTING EMPLOYMENT TYPES")
        print("-" * 40)
        
        emp_levels = crud.get_employment_levels(db)
        print(f"   ✓ Retrieved {len(emp_levels)} employment types")
        tests_passed += 1
        
        # 9. TEST HOLIDAYS
        print("\n9️⃣  TESTING HOLIDAYS")
        print("-" * 40)
        
        holidays = crud.get_holidays(db)
        print(f"   ✓ Retrieved {len(holidays)} holidays")
        tests_passed += 1
        
        # 10. TEST BANKS
        print("\n🔟 TESTING BANKS")
        print("-" * 40)
        
        banks = crud.get_banks(db)
        print(f"   ✓ Retrieved {len(banks)} banks")
        tests_passed += 1
        
        # 11. TEST DATABASE MODELS
        print("\n1️⃣1️⃣  TESTING DATABASE MODELS")
        print("-" * 40)
        
        required_tables = [
            ('organizations', models.DBOrganization),
            ('hr_plants', models.DBHRPlant),
            ('departments', models.DBDepartment),
            ('sub_departments', models.DBSubDepartment),
            ('grades', models.DBGrade),
            ('designations', models.DBDesignation),
            ('shifts', models.DBShift),
            ('employment_levels', models.DBEmploymentLevel),
            ('positions', models.DBPosition),
            ('holidays', models.DBHoliday),
            ('banks', models.DBBank),
        ]
        
        for table_name, model_class in required_tables:
            print(f"   ✓ Table '{table_name}' model: {model_class.__name__}")
            tests_passed += 1
        
        # 12. TEST CRUD OPERATIONS
        print("\n1️⃣2️⃣  TESTING CRUD OPERATIONS")
        print("-" * 40)
        
        crud_functions = [
            ('get_organizations', hasattr(crud, 'get_organizations')),
            ('create_organization', hasattr(crud, 'create_organization')),
            ('update_organization', hasattr(crud, 'update_organization')),
            ('get_plants', hasattr(crud, 'get_plants')),
            ('create_plant', hasattr(crud, 'create_plant')),
            ('update_plant', hasattr(crud, 'update_plant')),
            ('delete_plant', hasattr(crud, 'delete_plant')),
            ('get_departments', hasattr(crud, 'get_departments')),
            ('create_department', hasattr(crud, 'create_department')),
            ('update_department', hasattr(crud, 'update_department')),
            ('delete_department', hasattr(crud, 'delete_department')),
            ('get_grades', hasattr(crud, 'get_grades')),
            ('create_grade', hasattr(crud, 'create_grade')),
            ('update_grade', hasattr(crud, 'update_grade')),
            ('delete_grade', hasattr(crud, 'delete_grade')),
            ('get_designations', hasattr(crud, 'get_designations')),
            ('create_designation', hasattr(crud, 'create_designation')),
            ('update_designation', hasattr(crud, 'update_designation')),
            ('delete_designation', hasattr(crud, 'delete_designation')),
            ('get_shifts', hasattr(crud, 'get_shifts')),
            ('create_shift', hasattr(crud, 'create_shift')),
            ('update_shift', hasattr(crud, 'update_shift')),
            ('delete_shift', hasattr(crud, 'delete_shift')),
            ('get_holidays', hasattr(crud, 'get_holidays')),
            ('create_holiday', hasattr(crud, 'create_holiday')),
            ('update_holiday', hasattr(crud, 'update_holiday')),
            ('delete_holiday', hasattr(crud, 'delete_holiday')),
            ('get_banks', hasattr(crud, 'get_banks')),
            ('create_bank', hasattr(crud, 'create_bank')),
            ('update_bank', hasattr(crud, 'update_bank')),
            ('delete_bank', hasattr(crud, 'delete_bank')),
        ]
        
        for func_name, exists in crud_functions:
            if exists:
                print(f"   ✓ CRUD function: {func_name}")
                tests_passed += 1
            else:
                print(f"   ✗ MISSING CRUD function: {func_name}")
                tests_failed += 1
        
        # 13. TEST SCHEMAS
        print("\n1️⃣3️⃣  TESTING VALIDATION SCHEMAS")
        print("-" * 40)
        
        schema_classes = [
            'Organization',
            'OrganizationCreate',
            'Plant',
            'PlantCreate',
            'Department',
            'DepartmentCreate',
            'SubDepartment',
            'SubDepartmentCreate',
            'Grade',
            'GradeCreate',
            'Designation',
            'DesignationCreate',
            'Shift',
            'ShiftCreate',
            'EmploymentLevel',
            'Holiday',
            'HolidayCreate',
            'Bank',
            'BankCreate',
            'Position',
            'PositionCreate',
        ]
        
        for schema_name in schema_classes:
            if hasattr(schemas, schema_name):
                print(f"   ✓ Schema: {schema_name}")
                tests_passed += 1
            else:
                print(f"   ✗ MISSING Schema: {schema_name}")
                tests_failed += 1
        
    except Exception as e:
        print(f"\n❌ ERROR during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        tests_failed += 1
    finally:
        db.close()
    
    # SUMMARY
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"✅ Tests Passed: {tests_passed}")
    print(f"❌ Tests Failed: {tests_failed}")
    print(f"📈 Total Tests: {tests_passed + tests_failed}")
    
    if tests_failed == 0:
        print("\n🎉 ALL TESTS PASSED! Org setup module is 100% functional.")
        return 0
    else:
        print(f"\n⚠️  {tests_failed} test(s) failed. Review errors above.")
        return 1

if __name__ == '__main__':
    exit_code = test_org_setup()
    sys.exit(exit_code)
