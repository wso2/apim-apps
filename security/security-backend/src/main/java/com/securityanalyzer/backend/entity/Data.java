package com.securityanalyzer.backend.entity;

public class Data {

    private String id;
    private String commentAdded;
    private String currentState;

    public String getId() {

        return id;
    }

    public void setId(String id) {

        this.id = id;
    }

    public String getCommentAdded() {

        return commentAdded;
    }



    public void setCommentAdded(String commentAdded) {

        this.commentAdded = commentAdded;
    }

    public String getCurrentState() {

        return currentState;
    }

    public void setCurrentState(String state) {

        this.currentState = state;
    }
}
