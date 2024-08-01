import { useState, useEffect } from 'react';
import { getCredTypesApi } from "../api/credential-types";
import toast from "react-hot-toast";

const useCredentialTypes = (serverDownCode, setServerDownOpen) => {
  const [credTypes, setCredTypes] = useState([]);
  const [originalCredTypes, setOriginalCredTypes] = useState([]);

  const getCredTypes = async () => {
    try {
      const res = await getCredTypesApi();
      if (res.status !== 200) {
        toast.error("Error loading credential types");
        setCredTypes([]);
        if (res.status === serverDownCode) {
          setServerDownOpen(true);
        }
        return;
      }
      const body = await res.json();
      setOriginalCredTypes(body);
      setCredTypes(body);
    } catch (e) {
      console.error(e);
      toast.error("Error loading credential types");
    }
  };

  useEffect(() => {
    getCredTypes();
  }, []);

  return [setCredTypes, credTypes, originalCredTypes];
};

export default useCredentialTypes;
