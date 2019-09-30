import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isNullOrUndefined } from 'util';
//import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as moment from 'moment';
//import { PermissionModel } from '../src/model/permissions';

const express = require('express');
//const serviceAccount = require('../svc_alumni_test_key.json');
const serviceAccount = require('../firebase-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const app = express();
const main = express();

const cors = require('cors')({
    origin: [
        'http://localhost:4500',
        // Staging URL
        'https://alumniconnect.appspot.com',
        'https://alumni-bcrec.firebaseapp.com',
        'https://www.bcrecalumni.org'
    ]
});

//const cors = require('cors')({
//    origin: true
//});

//export class PermissionModel {
//    CanEditAlumni: boolean;
//    CanEditNews: boolean;
//    CanEditEvent: boolean;
//    CustomPermission: any;
//}

const db = admin.firestore();

main.use('/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);


app.get('/hello', (request: any, response: any) => {
    let message = { data: 'Hello from Firebase!' };
    cors(request, response, () => {
        response.send(message);
    });
}
);

//app.post('/testPost', (request: any, response: any) => {
//    cors(request, response, () => {
//        console.log(JSON.stringify(request.body));
//        response.status(201).send('added ');
//    });
//});

//app.post('/testperm/:email', (request: any, response: any) => {
//    let id = request.params.email;
//    let permissions: PermissionModel;
//    let profile: string;
//    cors(request, response, () => {
//        getPermission(id).then(p => {
//            permissions = p;
//            //console.log(JSON.stringify(p));
//            if (permissions.CanEditNews) {
//                profile = 'news admin';
//            } else {
//                profile = 'news reader';
//            }
//            response.status(201).send(profile);
//        });
//    });
//});

app.post('/alumni', (request: any, response: any) => {
    cors(request, response, () => {
        let body: any = request.body;
        console.log(JSON.stringify(body));
        if (body == null || body.firstname == null) {
            response.status(500).json({ message: 'invalid input for addAlumni()' });
        }

        //console.log(JSON.stringify(request.body.data));
        //console.log(JSON.stringify(body.firstname));
        console.log(JSON.stringify(request.headers));
        const firstname = body.firstname; //obj.firstname;
        const lastname = body.lastname;
        const department = body.department;
        const sex = body.sex;
        const phone = body.phone;
        const address = body.address;
        const dob = body.dob;
        let email = body.email;
        const graduationyear = body.graduationyear;
        const city = body.city;
        const region = body.region;
        const jobdescription = body.jobdescription;
        const profession = body.profession;
        const bloodgroup = body.bloodgroup;
        const middlename = body.middlename;
        const organization = body.organization;
        const rollnumber = body.rollnumber;

        var data = {
            'FirstName': firstname,
            'MiddleName': middlename == undefined ? '' : middlename,
            'LastName': lastname == undefined ? '' : lastname,
            'Sex': sex == undefined ? '' : sex,
            'Phone': phone == undefined ? '' : phone,
            'GraduationYear': graduationyear == undefined ? '' : graduationyear,
            'DateOfBirth': dob == undefined ? null : dob,
            'Department': department == undefined ? '' : department,
            'Profession': profession == undefined ? '' : profession,
            'JobDescription': jobdescription == undefined ? '' : jobdescription,
            'BloodGroup': bloodgroup == undefined ? '' : bloodgroup,
            'Organization': organization == undefined ? '' : organization,
            'City': city == undefined ? '' : city,
            'Region': region == undefined ? '' : region,
            'Address': address == undefined ? '' : address,
            'RollNumber': rollnumber == undefined ? '' : rollnumber
        };

        email = email.toLowerCase();
        //const obj = JSON.parse(data);

        db.collection('TestMembers').doc(email)
            .set(data, { merge: true }).then(() => {
                console.log(email + ' added');
                response.status(201).send('added ' + email);
            })
            .catch(c => {
                console.log('Error adding ' + email + ' : ' + c);
                response.status(500).send('Error adding ' + email + ' : ' + c);
            });

        //console.log(JSON.stringify(obj));
    });
});



/*
export const getAllAlumni = functions.https.onRequest((request, response) => {
    console.log('Called getAllAlumni');
    let datalist: any[];
    let count = 0;
    datalist = [];
    admin.firestore().collection('Members').get()
        .then(querySnapshot => {
            querySnapshot.docs.forEach(x => {
                //console.log(x.id);
                count++;
                datalist.push({
                    email: x.id,
                    data: x.data()
                })
                //console.log(x.data());   
            });
            //console.log(datalist);
            console.log('Count = ' + count);
            response.send(datalist);

        })
        .catch(c => {
            console.log('error in getAllAlumni() :' + c);
            response.status(500).send('cannot get getAllAlumni');
        });
});
*/

app.get('/finance/registration/year/:year', (request: any, response: any) => {
    console.log('Called /finance/registration/year/:year');

    let year = request.params.year;
    //let result: any;
    console.log(year);
    let datalist: any[];
    datalist = [];
    cors(request, response, () => {
        if (!isNullOrUndefined(year)) {            
            admin.firestore().collection('FinanceData' + year.toLowerCase()).get()
                .then(result => {
                    result.docs.forEach(x => {
                        const data = x.data();
                        datalist.push({
                            Id: data.Id,
                            Amount: data.Amount,
                            AlumniYear: data.AlumniYear 
                        });
                    });
                    response.send(datalist);                    
                })
                .catch(c => {
                    console.log('/finance/registration/year/:year' + c);
                    response.status(500).send('/finance/registration/year/:year');
                });
        } else {
            response.status(500).send('invalid year');
        }

    });
}
);

app.get('/alumni/email/:email', (request: any, response: any) => {
    console.log('Called /alumni/email/:email');
    let id = request.params.email;
    let result: any;
    console.log(id);
    cors(request, response, () => {
        if (!isNullOrUndefined(id)) {
            admin.firestore().doc('/Members/' + id.toLowerCase()).get()
                .then(item => {
                    try {
                        let data = item.data();
                        if (!isNullOrUndefined(data)) {
                            result = {
                                email: id,
                                firstname: data.FirstName,
                                lastname: data.LastName,
                                middlename: data.MiddleName,
                                region: data.Region,
                                department: data.Department,
                                sex: data.Sex,
                                graduationyear: data.GraduationYear,
                                city: data.City,
                                rollnumber: data.RollNumber
                            };
                            response.send(result);
                        } else {
                            response.status(404).send('cannot find record for ' + id);
                        }
                    } catch (c) {
                        console.log(c);
                    }
                })
                .catch(c => {
                    console.log('error in /alumni/email/:email :' + c);
                    response.status(500).send('cannot get /alumni/email/:email');
                });
        } else {
            response.status(500).send('invalid email');
        }

    });
}
);

app.get('/students/name', (request: any, response: any) => {
    console.log('Called /students/name');

    let datalist: any[];
    datalist = [];
    let count = 0;
    let query = request.param('query');
    console.log(query);
    cors(request, response, () => {

        const key = "Name";
        const value = query;
        console.log('Searching for ' + key + '=' + value);

        admin.firestore().collection('CollegeData').orderBy("Name")
            .startAt(value)
            .endAt(value + "\uf8ff").get()
            .then(querySnapshot => {
                querySnapshot.docs.forEach(x => {
                    //console.log(x.id);
                    count++;
                    try {
                        const data = x.data();
                        datalist.push({
                            serialno: count,
                            id: x.id,
                            name: data.Name,
                            department: data.Department,
                            graduationYear: data.GraduationYear,
                            isRegistered: data.IsRegistered == undefined ? false : data.IsRegistered
                        });

                        //console.log(x.data());   
                    } catch (c) {
                        console.log(c);
                    }

                });
                //console.log(datalist);
                console.log(datalist.length);
                response.send(datalist);

            })
            .catch(c => {
                console.log('error in /students/name :' + c);
                response.status(500).send('cannot get /students/name');
            });

    });


}
);

app.get('/students/param', (request: any, response: any) => {
    console.log('Called /students/param');

    let datalist: any[];
    datalist = [];
    let count = 0;
    let query = request.param('query');
    console.log(query);
    cors(request, response, () => {
        if (query.includes(':')) {

            const key = query.substring(0, query.indexOf(':'));
            const value = query.substring(query.indexOf(':') + 1);
            console.log('Searching for ' + key + '=' + value);
            admin.firestore().collection('CollegeData').where(key, "==", value).get()
                .then(querySnapshot => {
                    querySnapshot.docs.forEach(x => {
                        //console.log(x.id);
                        count++;
                        try {
                            const data = x.data();
                            datalist.push({
                                serialno: count,
                                id: x.id,
                                name: data.Name,
                                department: data.Department,
                                graduationYear: data.GraduationYear,
                                isRegistered: data.IsRegistered == undefined ? false : data.IsRegistered
                            });

                            //console.log(x.data());   
                        } catch (c) {
                            console.log(c);
                        }

                    });
                    //console.log(datalist);
                    console.log(datalist.length);
                    response.send(datalist);

                })
                .catch(c => {
                    console.log('error in /students/param :' + c);
                    response.status(500).send('cannot get /students/param');
                });
        } else {
            response.status(500).send('invalid parameters');
        }
    });


}
);

app.get('/top-news', (request: any, response: any) => {
    console.log('Called /top-news');
    let datalist: any[];
    datalist = [];
    let value = moment.now();

    cors(request, response, () => {
        admin.firestore().collection('TopNews').where("NewsDate", "<=", new Date(value)).get()
            .then(result => {
                result.docs.forEach(x => {
                    const data = x.data();
                    datalist.push({
                        description: data.Description,
                        newsDate: new Date(data.NewsDate.toDate()),
                        title: data.Title
                    });
                });
                response.send(datalist);
            }
            )
            .catch(c => {
                console.log('error in /top-news :' + c);
                response.status(500).send('cannot get /top-news');
            }
            );
    });

});

app.get('/birthdate', (request: any, response: any) => {
    console.log('Called birthdate');
    let datalist: any[];
    datalist = [];
    //let value = moment.now();
    let startDate = new Date();
    let endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    console.log(endDate);
    cors(request, response, () => {
        admin.firestore().collection('Members').get()
            .then(result => {
                result.docs.forEach(x => {
                    const data = x.data();
                    if (data.DateOfBirth != undefined && data.DateOfBirth != null && data.DateOfBirth != '') {
                        let dob = new Date(data.DateOfBirth);
                        dob = new Date(dob.getMonth().toString() + '/' + dob.getDate().toString() + '/' + endDate.getFullYear().toString())
                        if (dob >= startDate && dob <= endDate) {
                            datalist.push({
                                firstName: data.FirstName,
                                lastName: data.LastName,
                                dateOfBirth: dob,
                                department: data.Department,
                                graduationYear: data.GraduationYear
                            });
                        }
                    }                    
                    
                });
                response.send(datalist);
            }
            )
            .catch(c => {
                console.log('error in /birthdate :' + c);
                response.status(500).send('cannot get /birthdate');
            }
            );
    });

});

app.get('/testimonials', (request: any, response: any) => {
    console.log('Called /testimonials');
    let datalist: any[];
    datalist = [];
    //let value = moment.now();

    cors(request, response, () => {
        admin.firestore().collection('Testimonials').get()
            .then(result => {
                result.docs.forEach(x => {
                    const data = x.data();
                    datalist.push({
                        detail: data.Detail,
                        author: data.Author,
                        name: data.AuthorName,
                        title: data.Title
                    });
                });
                response.send(datalist);
            }
            )
            .catch(c => {
                console.log('error in /testimonials :' + c);
                response.status(500).send('cannot get /testimonials');
            }
            );
    });

});

app.get('/event-calendar', (request: any, response: any) => {
    console.log('Called /event-calendar');
    let datalist: any[];
    datalist = [];
    let value = moment.now();
    value = value - (12 * 3600 * 1000);
    console.log(new Date(value));

    cors(request, response, () => {
        admin.firestore().collection('EventCalendar').where("ScheduledOn", ">=", new Date(value)).get()
            .then(result => {
                result.docs.forEach(x => {
                    const data = x.data();
                    datalist.push({
                        description: data.Description,
                        eventDate: data.ScheduledOn.toDate(),
                        name: data.Name,
                        location: data.Location
                    });
                });
                response.send(datalist);
            }
            )
            .catch(c => {
                console.log('error in /event-calendar :' + c);
                response.status(500).send('cannot get /event-calendar');
            }
            );
    });

});



//app.get('/alumni/permissions/:email', (request: any, response: any) => {
//    console.log('Called /alumni/permission/:email');
//    let id = request.params.email;
//    let result = new PermissionModel();
//    console.log(id);

//    cors(request, response, () => {

//        if (!isNullOrUndefined(id)) {

//            getPermission(id).then(res => {
//                console.log(JSON.stringify(res));
//                admin.firestore().doc('/Permissions/' + id.toLowerCase()).get()
//                    .then(item => {
//                        try {
//                            let data = item.data();

//                            if (!isNullOrUndefined(data)) {
//                                result.CanEditAlumni = data.CanEditAlumni == undefined ? false : data.CanEditAlumni;
//                                result.CanEditEvent = data.CanEditEvent == undefined ? false : data.CanEditEvent;
//                                result.CanEditNews = data.CanEditNews == undefined ? false : data.CanEditNews;
//                                result.CustomPermission = res;
//                                response.send(result);
//                            } else {
//                                response.status(404).send('cannot find permission for ' + id);
//                            }
//                        } catch (c) {
//                            console.log(c);
//                        }
//                    })
//                    .catch(c => {
//                        console.log('error in /alumni/permissions/:email :' + c);
//                        response.status(500).send('cannot get /alumni/permissions/:email');
//                    });
//            });

//        } else {
//            result.CanEditAlumni = false;
//            result.CanEditEvent = false;
//            result.CanEditNews = false;
//            result.CustomPermission = null;
//            response.send(result);
//        }

//    });
//}
//);

//function getPermission(id: string) {

//    // Return new promise 
//    return new Promise<PermissionModel>(function (resolve, reject) {

//        let result = new PermissionModel();
//        // Do async job
//        admin.firestore().doc('/Permissions/' + id.toLowerCase()).get()
//            .then(item => {
//                try {
//                    let data = item.data();
//                    if (!isNullOrUndefined(data)) {
//                        result.CanEditAlumni = data.CanEditAlumni == undefined ? false : data.CanEditAlumni;
//                        result.CanEditEvent = data.CanEditEvent == undefined ? false : data.CanEditEvent;
//                        result.CanEditNews = data.CanEditNews == undefined ? false : data.CanEditNews;
//                        resolve(result);
//                    } else {
//                        console.log('cannot find permission for ' + id);
//                        resolve(result);
//                    }
//                } catch (c) {
//                    console.log(c);
//                }
//            })
//            .catch(c => {
//                console.log('error in /testimonials :' + c);
//                resolve(result);
//            }
//            );
//    })

//}


