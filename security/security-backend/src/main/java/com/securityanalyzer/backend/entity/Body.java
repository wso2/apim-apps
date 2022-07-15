package com.securityanalyzer.backend.entity;

import java.util.ArrayList;

public class Body {

    private ArrayList<Data> vulnerabilities;

    public ArrayList<Data> getVulnerabilities() {

        return vulnerabilities;
    }

    public void setVulnerabilities(ArrayList<Data> vulnerabilities) {

        this.vulnerabilities = vulnerabilities;
    }
}
