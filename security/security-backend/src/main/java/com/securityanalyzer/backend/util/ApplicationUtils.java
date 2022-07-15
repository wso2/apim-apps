package com.securityanalyzer.backend.util;

import com.google.common.collect.Table;
import com.google.gson.Gson;
import com.securityanalyzer.backend.entity.Constant;
import com.securityanalyzer.backend.entity.Vulnerability;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;


import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

public class ApplicationUtils {

    private static Logger logger = (Logger) LoggerFactory.getLogger(ApplicationUtils.class);

    /**
     * The serializeList method serializes the collection Table and write it to the text file
     */
    public static void serializeList(Table<String,String,ArrayList<Vulnerability>> tree, String portalName,String branchName) {


        try {
            FileOutputStream fileOutput = new FileOutputStream("vulnerabilities.txt");
            ObjectOutputStream output = null;
            output = new ObjectOutputStream(fileOutput);
            output.writeObject(tree);
            output.close();
            fileOutput.close();
            logger.info(String.format("Serialized data is saved in file for %s %s after serializing", portalName,branchName));
        } catch (FileNotFoundException e) {
            logger.error(e.getMessage(), e);
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
        }
    }

    /**
     * The deserializeList method deserializes the collection Table  written in text file and returns a Table */
    public static Table<String,String,ArrayList<Vulnerability>> deSerializeList(String portalName,String branchName) {

        Table<String,String,ArrayList<Vulnerability>> table = null;

        try {
            FileInputStream fileInput = new FileInputStream(Constant.TEXT_FILE_NAME);
            ObjectInputStream input = new ObjectInputStream(fileInput);
            table=(Table<String,String,ArrayList<Vulnerability>>) input.readObject();
            input.close();
            fileInput.close();
            logger.info(String.format("Serialized data is received from vulnerabilities.txt for  %s %s", portalName,branchName));
        } catch (FileNotFoundException e) {

            logger.warn("Application runs for the first time.");
            return null;
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
        } catch (ClassNotFoundException e) {
            logger.error(e.getMessage(), e);
        }
        return table;
    }

    /**
     * The checkExistenceOfVulnerabilityInTheList method loops through the list and check whether is there any instance with the same id of given Vulnerability V.
     */
    private static boolean checkExistenceOfVulnerabilityInTheList(ArrayList<Vulnerability> list, Vulnerability v) {

        for (int i = 0; i < list.size(); i++) {
            if (v.getId().equals(list.get(i).getId()) && v.getFrom().equals(list.get(i).getFrom())) {
                return true;
            }
        }
        return false;
    }
/**
 * The getVulnerabilityListFromJSON generates an ArrayList of Vulnerability Objects from the JSON file of the specific portal and branch from Snyk
 * */
    public static ArrayList<Vulnerability> getVulnerabilityListFromJSON(String portalName,String branchName) throws FileNotFoundException {

        String text = null;
        String path="";
        Vulnerability v;
        Gson gson = new Gson();
        ArrayList<Vulnerability> vulnerabilities = new ArrayList<>();
        byte[] resource = null;

        try {
            if (branchName.equals("main")){
                 path = String.format("%s.json", portalName);
            }else{
                 path = String.format("%s_%s.json", portalName,branchName);
            }


            FileInputStream fileInput = new FileInputStream(path);
            resource = fileInput.readAllBytes();
            text = new String(resource);
        } catch (FileNotFoundException e) {
            logger.error(String.format("Json File %s not found.",path));
            throw e;




        } catch (IOException e) {
            logger.error(e.getMessage(), e);
        }

        JSONObject jsonDocument = (JSONObject) JSONValue.parse(text);
        HashMap<String, Object> map = new HashMap<>();
        Iterator<String> iter = jsonDocument.keySet().iterator();
        while (iter.hasNext()) {
            String key = iter.next();
            map.put(key, jsonDocument.get(key));
        }

        ArrayList<Object> vulns = (ArrayList<Object>) map.get("vulnerabilities");
        Iterator it = vulns.iterator();
        while (it.hasNext()) {

            v = gson.fromJson(String.valueOf(it.next()), Vulnerability.class);



            if (v.getState() == null) {
                v.setState("new");
            }
            vulnerabilities.add(v);

        }
        return vulnerabilities;
    }

    /**
     * The addNewlyIdentifiedVulnerabilities method add any new vulnerabilities that are received from the json to the ArrayList that we got from deserializing the text file.
     * */
    public static void addNewlyIdentifiedVulnerabilities(ArrayList<Vulnerability> vulnerabilities, ArrayList<Vulnerability> oldList) {

        for (int counter = 0; counter < vulnerabilities.size(); counter++) {
            if (checkExistenceOfVulnerabilityInTheList(oldList, vulnerabilities.get(counter)))
                continue;
            else

                oldList.add(vulnerabilities.get(counter));
        }

    }
    /**
     * The removeFalsePositives method remove any vulnerabilities that are existing in the deserialized ArrayList and not existing in the ArrayList got from JSON file.
     * */
    public static ArrayList<Vulnerability> removeFalsePositives(ArrayList<Vulnerability> vulnerabilities, ArrayList<Vulnerability> oldList) {

        ArrayList<Vulnerability> newList = new ArrayList<Vulnerability>();
        for (int counter = 0; counter < oldList.size(); counter++) {

            if (checkExistenceOfVulnerabilityInTheList(vulnerabilities, oldList.get(counter)))
                newList.add(oldList.get(counter));

            else
                continue;

        }
        return newList;

    }

}


