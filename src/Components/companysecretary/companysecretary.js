import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

export const getLicenceMaster = () => {
  return apiRequest(`${HmsBaseUrl}get_licence_master/`, "GET");
};

export const saveLicenceMaster = (payload) => {
  return apiRequest(`${HmsBaseUrl}get_licence_master/`, "POST", payload);
};

export const getLicenceDetails = () => {
  return apiRequest(`${HmsBaseUrl}licence_master_details/`, "GET");
};

export const saveLicenceDetails = (payload) => {
  return apiRequest(`${HmsBaseUrl}licence_master_details/`, "POST", payload);
};

export const getInchargeList = () => {
  return apiRequest(`${HmsBaseUrl}get_incharge_list/`, "GET");
};

export const updateLicenceDetails = (s_no, payload) => {
  return apiRequest(`${HmsBaseUrl}licence_master_details/${s_no}/`, "PUT", payload);
};