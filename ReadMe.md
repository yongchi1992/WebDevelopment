# AdherencePill Project Backend Implementation
In the back-end side, we mainly supply the **RESTful API** for the front-end side and provide the data to them so that in the front-end, people can only focus on the [page word](https://github.com/AdherencePillProject/web_cloud). No need to think about how to retrieve data and how to communicate with database.

Here, we will give introduce two important things for both the front-end and back-end people to have a better communication with each other.

## Structure of the Database
#### **There are 5 important tables:**

```
1. User
2. Patient
3. Doctor
4. Appointment
5. Prescription
```

#### **User**
This table is the most important table for the user management which is the build-in class of the Parse Server and it contains these fields:

```
1. objectId(unique ID)
2. username
3. password
4. firstname
5. lastname
6. email
7. dateOfBirth
8. emailVerified(whether a user has activated the email[True or False])
9. passwordResettingToken(Used for resetting password)
10. patientPointer(point to the corresponding patient in the Patient table if this user is a patient)
11. doctorPointer(point to the corresponding doctor in the Doctor table if this user is a doctor)
```

#### **Patient**
This table is to store the user which is a patient and it contains these fields:

```
1. objectId(unique ID)
2. userAccount(point to the corresponding user in the User table)
```

#### **Doctor**
This table is to store the user which is a doctor and it contains these fields:

```
1. objectId(unique ID)
2. userAccount(point to the corresponding user in the User table)
3. hospitalName
4. hospitalAddress
5. hospitalCity
```

#### **Appointment**
This table is to store the appointment made between a patient and a doctor and it contains these fields:

```
1. objectId(unique ID)
2. time
3. doctor(point to the corresponding doctor in the Doctor table if this user is a doctor)
4. patient(point to the corresponding patient in the Patient table if this user is a patient)
```


#### **Prescription**
This table is to store the patient's prescription and it contains these fields:

```
1. objectId(unique ID)
2. patientID(point to the corresponding patient in the Patient table if this user is a patient)
3. pillName
4. bottle
5. TokenInfo
6. consumptionTime
7. numberLeft
8. schedule
9. description
10. dose
```


## RESTful API
```
GET
1. /account?


POST

PUT
```
