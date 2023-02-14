import { useApi, fakePersons, fakeAccessGroups } from "./api-config";
import axios from "axios";
import { sendApi } from "./api-helpers";
import { apiUri } from "./api-config";
import toast from "react-hot-toast";

class PersonApi {
  createPerson({
    personFirstName,
    personLastName,
    personUid,
    personMobileNumber,
    personEmail,
    accessGroup,
  }) {
    personFirstName = personFirstName === "" ? null : personFirstName;
    personLastName = personLastName === "" ? null : personLastName;
    personUid = personUid === "" ? null : personUid;
    personMobileNumber = personMobileNumber === "" ? null : personMobileNumber;
    personEmail = personEmail === "" ? null : personEmail;
    accessGroup = accessGroup === "" ? null : accessGroup;

    if (useApi) {
      return sendApi("/api/person", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          personFirstName,
          personLastName,
          personUid,
          personMobileNumber,
          personEmail,
          accessGroup,
        }),
      });
    }

    const newPerson = {
      personId:
        fakePersons.map((p) => p.personId).reduce((a, b) => Math.max(a, b), 0) +
        1,
      personFirstName,
      personLastName,
      // if no uid, generate random uid
      personUid: personUid || String(Math.floor(Math.random() * 10 ** 8)),
      personMobileNumber,
      personEmail,
      accessGroup: accessGroup && accessGroup.accessGroupId,
    };

    fakePersons.push(newPerson);

    // did not populate access group as not required
    return Promise.resolve(
      new Response(JSON.stringify(newPerson), { status: 201 })
    );
  }

  getPersons() {
    if (useApi) {
      return sendApi("/api/persons");
    }

    const persons = fakePersons.map((p) => {
      return { ...p };
    });

    persons.forEach((person) => {
      if (person.accessGroup) {
        // populate access group
        person.accessGroup = {
          ...fakeAccessGroups.find(
            (group) => group.accessGroupId == person.accessGroup
          ),
        };
      }
      return person;
    });
    return Promise.resolve(
      new Response(JSON.stringify(persons), { status: 200 })
    );
  }

  getPerson(id) {
    if (useApi) {
      return sendApi(`/api/person/${id}`);
    }

    const person = { ...fakePersons.find((p) => p.personId == id) };

    if (person) {
      if (person.accessGroup) {
        // populate access group
        person.accessGroup = {
          ...fakeAccessGroups.find(
            (group) => group.accessGroupId == person.accessGroup
          ),
        };
      }
      return Promise.resolve(
        new Response(JSON.stringify(person), { status: 200 })
      );
    }

    return Promise.resolve(
      new Response(
        JSON.stringify({ personId: `Person with Id ${id} does not exist` }),
        { status: 404 }
      )
    );
  }

  updatePerson({
    personId,
    personFirstName,
    personLastName,
    personUid,
    personMobileNumber,
    personEmail,
    accessGroup,
  }) {
    personId = personId || null;
    personFirstName = personFirstName || null;
    personLastName = personLastName || null;
    personUid = personUid || null;
    personMobileNumber = personMobileNumber || null;
    personEmail = personEmail || null;
    accessGroup = accessGroup || null;

    if (useApi) {
      return sendApi("/api/person", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          personId,
          personFirstName,
          personLastName,
          personUid,
          personMobileNumber,
          personEmail,
          accessGroup,
        }),
      });
    }
  }

  deletePerson(id) {
    if (useApi) {
      return sendApi(`/api/person/${id}`, { method: "DELETE" });
    }

    const index = fakePersons.findIndex((person) => person.personId == id);
    if (index == -1) {
      return Promise.resolve(
        new Response(
          JSON.stringify({ personId: `Person with Id ${id} does not exist` }),
          { status: 404 }
        )
      );
    }

    fakePersons.splice(index, 1);

    return Promise.resolve(new Response(null, { status: 204 }));
  }

  uidExists(uid) {
    //if it exists db
    if (useApi) {
      return sendApi(`/api/person/uid/${uid}`);
    }

    return Promise.resolve(
      new Response(
        JSON.stringify(fakePersons.some((person) => person.personUid == uid)),
        { status: 200 }
      )
    );
  }

  uidInUse(uid, id) {
    //if it is in use by others
    if (useApi) {
      return sendApi(`/api/person/uid/${id}/${uid}`);
    }

    return Promise.resolve(
      new Response(
        JSON.stringify(
          fakePersons.some(
            (person) => person.personUid == uid && person.personId != id
          )
        ),
        { status: 200 }
      )
    );
  }

  mobileNumberExists(mobileNumber) {
    //for create person
    if (useApi) {
      return sendApi(`/api/person/mobileNumber/${mobileNumber}`);
    }

    return Promise.resolve(
      new Response(
        JSON.stringify(
          fakePersons.some(
            (person) => person.personMobileNumber == mobileNumber
          )
        ),
        { status: 200 }
      )
    );
  }

  emailExists(email) {
    //for create person
    if (useApi) {
      return sendApi(`/api/person/email/${email}`);
    }

    return Promise.resolve(
      new Response(
        JSON.stringify(
          fakePersons.some((person) => person.personEmail == email)
        ),
        { status: 200 }
      )
    );
  }

  postCSV(formData) {
    return sendApi(
      "/api/person/importcsv",
      {
        method: "POST",
        body: formData,
      },
      "multipart/form-data"
    );

    // return axios.post(apiUri + "/api/person/importcsv", formData, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // });
  }

  getCSVJson() {
    // if (useApi) {
    // return sendApi("/api/person/importcsv/json", {
    //   method: "GET",
    // });
    // }
    if (useApi) {
      return sendApi("/api/person/importcsv/json", {
        method: "GET",
      });
    }

    return Promise.resolve(
      new Response(
        JSON.stringify(
          fakePersons.some((person) => person.personEmail == email)
        ),
        { status: 200 }
      )
    );
  }

  //   importCSV = async (CSVData) => {
  //     const formData = new FormData();
  //     formData.append("file", CSVData, "file.csv");
  //     try {
  //       // sendApi doesnt send multipart request

  //       // const boundary =
  //       //   "------WebKitFormBoundary" + Math.random().toString(36).substr(2);
  //       // sendApi("/api/person/importcsv", {
  //       //   method: "POST",
  //       //   body: formData,
  //       //   headers: {
  //       //     "Content-Type": `multipart/form-data; boundary=${boundary}`,
  //       //   },
  //       // });

  //       // use axios for now, apiUri is BE address

  //       await axios.post(apiUri + "/api/person/importcsv", formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });

  //       alert("File uploaded successfully");
  //     } catch (error) {
  //       console.error(error);
  //       alert(
  //         "Failed to upload file, excel first row headers need to match import template"
  //       );
  //     }
  //   };
  // }
}
export const personApi = new PersonApi();
