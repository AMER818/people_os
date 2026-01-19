import sys
import os
import uuid

# Add path to import backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal, engine
    import models
    import crud
    import schemas
except ImportError:
    # Try creating a dummy environment if imports fail (shouldn't happen if run from backend dir)
    sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    from backend.database import SessionLocal, engine
    from backend import models, crud, schemas

def verify_relationships():
    db = SessionLocal()
    print("="*60)
    print("🛠️  FUNCTIONAL RELATIONSHIP VERIFICATION")
    print("="*60)

    try:
        # 1. Create Organization
        org_id = f"TEST-ORG-{uuid.uuid4().hex[:8]}"
        org = models.DBOrganization(
            id=org_id,
            name="Test Relationship Org",
            code=f"ORG-{uuid.uuid4().hex[:4]}",
            is_active=True
        )
        db.add(org)
        db.commit()
        print(f"✅ Created Org: {org.name} ({org.id})")

        # 2. Create Plant with Divisions
        plant_create = schemas.PlantCreate(
            name=f"Test Plant {uuid.uuid4().hex[:4]}",
            code=f"PLT-{uuid.uuid4().hex[:4]}",
            location="Test Location",
            organizationId=org_id,
            divisions=[
                schemas.PlantDivisionCreate(name="Div A", code="DA"),
                schemas.PlantDivisionCreate(name="Div B", code="DB")
            ]
        )
        # Use CRUD to ensure logic handles divisions
        plant = crud.create_plant(db, plant_create, user_id="tester")
        print(f"✅ Created Plant: {plant.name}")
        
        # Verify Divisions
        if len(plant.divisions) == 2:
             print(f"   PLEASE NOTE: Plant has {len(plant.divisions)} divisions (Correct)")
        else:
             print(f"❌ ERROR: Plant has {len(plant.divisions)} divisions (Expected 2)")

        # 3. Create Department linked to Plant
        dept_id = str(uuid.uuid4())
        dept = models.DBDepartment(
            id=dept_id,
            name=f"Test Dept {uuid.uuid4().hex[:4]}",
            code=f"DPT-{uuid.uuid4().hex[:4]}",
            organization_id=org_id,
            plant_id=plant.id,
            isActive=True
        )
        db.add(dept)
        db.commit()
        print(f"✅ Created Dept: {dept.name} -> Linked to Plant: {plant.name}")

        # 4. Create Employment Level
        level_id = str(uuid.uuid4())
        level = models.DBEmploymentLevel(
            id=level_id,
            name=f"Test Level {uuid.uuid4().hex[:4]}",
            code=f"LVL-{uuid.uuid4().hex[:4]}",
            organization_id=org_id
        )
        db.add(level)
        db.commit()
        print(f"✅ Created Level: {level.name}")

        # 5. Create Grade linked to Level
        grade_id = str(uuid.uuid4())
        grade = models.DBGrade(
            id=grade_id,
            name=f"Test Grade {uuid.uuid4().hex[:4]}",
            level=1,
            employment_level_id=level.id,
            organization_id=org_id
        )
        db.add(grade)
        db.commit()
        print(f"✅ Created Grade: {grade.name} -> Linked to Level: {level.name}")

        # 6. Create Designation linked to Grade AND Department
        desig_id = str(uuid.uuid4())
        desig = models.DBDesignation(
            id=desig_id,
            name=f"Test Designation {uuid.uuid4().hex[:4]}",
            grade_id=grade.id,
            department_id=dept.id,
            organization_id=org_id
        )
        db.add(desig)
        db.commit()
        print(f"✅ Created Designation: {desig.name}")
        print(f"   -> Linked to Grade: {grade.name}")
        print(f"   -> Linked to Dept: {dept.name}")

        # 7. VERIFY TRAVERSAL (The Real Test)
        print("\n🔎 Verifying Traversal from Designation:")
        
        # Refresh to ensure relationships are loaded
        db.refresh(desig)
        
        # Check Structural Hierarchy
        # Note: SQLAlchemy relationships need to be defined in models for dot notation access.
        # Based on previous inspection, DBDesignation has grade_id and department_id columns.
        # Does it have 'department' relationship? Let's check crud/models or just query.
        
        fetched_desig = db.query(models.DBDesignation).filter(models.DBDesignation.id == desig_id).first()
        fetched_dept = db.query(models.DBDepartment).filter(models.DBDepartment.id == fetched_desig.department_id).first()
        fetched_plant = db.query(models.DBHRPlant).filter(models.DBHRPlant.id == fetched_dept.plant_id).first()
        fetched_grade = db.query(models.DBGrade).filter(models.DBGrade.id == fetched_desig.grade_id).first()
        
        if fetched_dept and fetched_dept.id == dept.id:
            print("   ✅ Designation -> Department Link: SUCCESS")
        else:
            print(f"   ❌ Designation -> Department Link: FAILED (Got {fetched_desig.department_id}, Expected {dept.id})")

        if fetched_plant and fetched_plant.id == plant.id:
            print("   ✅ Department -> Plant Link: SUCCESS")
        else:
            print("   ❌ Department -> Plant Link: FAILED")

        if fetched_grade and fetched_grade.id == grade.id:
             print("   ✅ Designation -> Grade Link: SUCCESS")
        else:
             print("   ❌ Designation -> Grade Link: FAILED")

        print("\n" + "="*60)
        print("🎉 RELATIONSHIP VERIFICATION COMPLETE")
        print("="*60)
        
        # Cleanup (Optional, but good for cleanliness)
        # db.delete(desig)
        # db.delete(grade)
        # db.delete(level)
        # db.delete(dept)
        # db.delete(plant)
        # db.delete(org)
        # db.commit()

    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    verify_relationships()
