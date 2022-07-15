package com.securityanalyzer.backend.service.impl;

import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
import com.securityanalyzer.backend.entity.Body;
import com.securityanalyzer.backend.entity.Data;
import com.securityanalyzer.backend.entity.Vulnerability;
import com.securityanalyzer.backend.service.VulnerabilityService;
import com.securityanalyzer.backend.util.ApplicationUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Objects;

/**
 * The getAllVulnerabilities method has the business logic
 * for getting the list of vulnerabilities by comparing the existing vulnerabilities
 * and vulnerabilities in the newly generated json file.
 */
@Service
public class VulnerabiltyServiceImpl implements VulnerabilityService {

    /**
     * The getAllVulnerabilities method has the business logic
     * for getting the list of vulnerabilities by comparing the existing vulnerabilities
     * and vulnerabilities in the newly generated json file.
     */

    private static Logger logger = (Logger) LoggerFactory.getLogger(ApplicationUtils.class);

    @Override
    public ArrayList<Vulnerability> getAllVulnerabilitiesByPortal(String portalName, String branchName) throws FileNotFoundException {


        ArrayList<Vulnerability> vulnerabilities = null;
        try {
            vulnerabilities = ApplicationUtils.getVulnerabilityListFromJSON(portalName,branchName);  //list of vulnerabilities from Json file generated from snyk analysis
        } catch (FileNotFoundException e) {
            throw e;
        }

        Table<String,String, ArrayList<Vulnerability>> oldTable = ApplicationUtils.deSerializeList(portalName,branchName);
        ArrayList<Vulnerability> oldList;// list of vulnerabilities serialized previously in text file

        if (Objects.equals(oldTable, null)) {
            oldList = vulnerabilities;
            Table<String,String, ArrayList<Vulnerability>> table = HashBasedTable.create();;
            table.put(portalName,branchName, oldList);
            ApplicationUtils.serializeList(table, portalName,branchName);
            return vulnerabilities;
        } else {
            oldList = oldTable.get(portalName,branchName);
            if (Objects.equals(oldList, null)) {
                oldTable.put(portalName,branchName, vulnerabilities);
                ApplicationUtils.serializeList(oldTable, portalName,branchName);
                return vulnerabilities;

            } else {


                /* add newly identified vulnerabilities from the JSON file to the  list of vulnerabilities
                to be serialized in the text file */
                ApplicationUtils.addNewlyIdentifiedVulnerabilities(vulnerabilities, oldList);
                /*remove vulnerabilities which are already serialized in the text file
                 and missing in list of vulnerabilities from JSON file. */
                oldList = ApplicationUtils.removeFalsePositives(vulnerabilities, oldList);

                oldTable.put(portalName,branchName,oldList);
                //serialize the modified Table to the text file.
                ApplicationUtils.serializeList(oldTable, portalName,branchName);
                return oldList;

            }
        }
    }

    /**
     * The makeChangesOnVulnerabilities method has the business logic
     * for making changes on a number of vulnerabilities by comparing the existing vulnerabilities
     * and vulnerabilities coming in the request.
     */

    @Override
    public void makeChangesOnVulnerabilities(Body body, String portalName, String branchName) {

        Table<String,String,ArrayList<Vulnerability>> oldTable = ApplicationUtils.deSerializeList(portalName,branchName);
        ArrayList<Vulnerability> oldList=oldTable.get(portalName,branchName);

        ArrayList<Data> vulnerabilities = body.getVulnerabilities();
        for (int counter = 0; counter < oldList.size(); counter++) {
            for (int counter1 = 0; counter1 < vulnerabilities.size(); counter1++) {
                if ((vulnerabilities.get(counter1).getId()).equals(oldList.get(counter).getId())) {

                    oldList.get(counter).setState(vulnerabilities.get(counter1).getCurrentState());
                    oldList.get(counter).setComment(vulnerabilities.get(counter1).getCommentAdded());
                }
            }
        }
        oldTable.put(portalName,branchName,oldList);
        ApplicationUtils.serializeList(oldTable, portalName,branchName);
    }


    /**
     * The getLastModifiedTime method returns the last time the json file was modified.
     */
    @Override
    public Date getLastModifiedTime(String portalName, String branchName) {
        String path = "";
        if (branchName.equals("main")){
            path = String.format("%s.json", portalName);
        }else{
            path = String.format("%s_%s.json", portalName,branchName);

        }

        File resource = null;
        resource = new File(path);
        long lastModified = resource.lastModified();
        Date date = new Date(lastModified);
        return date;

    }

}





