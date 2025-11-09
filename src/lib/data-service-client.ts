import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const db = getFirestore();
const storage = getStorage();

const getCollection = (collectionName) => {
    return getDocs(collection(db, collectionName));
}

const addDocument = (collectionName, data) => {
    return addDoc(collection(db, collectionName), data);
}

const updateDocument = (collectionName, id, data) => {
    const docRef = doc(db, collectionName, id);
    return updateDoc(docRef, data);
}

const deleteDocument = (collectionName, id) => {
    const docRef = doc(db, collectionName, id);
    return deleteDoc(docRef);
}

export const dataService = {
  getRoutes: () => getCollection("routes"),
  addRoute: (route) => addDocument("routes", route),
  updateRoute: (id, route) => updateDocument("routes", id, route),
  deleteRoute: (id) => deleteDocument("routes", id),

  getDrivers: () => getCollection("drivers"),
  addDriver: (driver) => addDocument("drivers", driver),
  updateDriver: (id, driver) => updateDocument("drivers", id, driver),
  deleteDriver: (id) => deleteDocument("drivers", id),

  getAlerts: () => getCollection("alerts"),
  addAlert: (alert) => addDocument("alerts", alert),
  updateAlert: (id, alert) => updateDocument("alerts", id, alert),
  deleteAlert: (id) => deleteDocument("alerts", id),
};

export const storageService = {
    uploadFile: async (file, path) => {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { downloadURL, path };
    },
    deleteFile: (path) => {
        const storageRef = ref(storage, path);
        return deleteObject(storageRef);
    }
};