package com.awesomecontrols.sigmawrapper;

import org.json.JSONObject;

public class Node {
    JSONObject nodeConfig = new JSONObject();
    JSONObject attributes = new JSONObject();
    
    public Node(double x, double y) {
        nodeConfig.put("attributes", attributes);
        attributes.put("x", x);
        attributes.put("y", y);
    }
    //x: number,y: number,id?: string,  label?: string, color?: string, size?: number, type?: any
    public Node setX(double x) {
        attributes.put("x", x);
        return this;
    }
    
    public Node setY(double y) {
        attributes.put("y", y);
        return this;
    }
    
    public Node setId(String id) {
        nodeConfig.put("key", id);
        attributes.put("id", id);
        return this;
    }
    
    public Node setLabel(String label) {
        attributes.put("label", label);
        return this;
    }
    
    public Node setColor(String color) {
        attributes.put("color", color);
        return this;
    }
    
    public Node setBorderColor(String color) {
        attributes.put("boderColor", color);
        return this;
    }
    
    public Node setFillColor(String color) {
        attributes.put("fillColor", color);
        return this;
    }
    
    public Node setDotColor(String color) {
        attributes.put("dotColor", color);
        return this;
    }
    
    public Node setSize(int size) {
        attributes.put("size", size);
        return this;
    }
    
    public Node setType(String type) {
        attributes.put("type", type);
        return this;
    }

    public Node setPictoColor(String color) {
        attributes.put("pictoColor", color);
        return this;
    }
    
    public Node setImageURL(String url) {
        attributes.put("image", url);
        return this;
    }
    
    public Node setBorderSize(double size) {
        attributes.put("borderSize", size);
        return this;
    }
    
    
    public Node setStringAttribute(String attr, String value) {
        attributes.put(attr, value);
        return this;
    }
    
    public String getStringAttribute(String attr) {
        return attributes.getString(attr);
    }

    public Node setIntAttribute(String attr, int value) {
        attributes.put(attr, value);
        return this;
    }
    
    public int getIntAttribute(String attr) {
        return attributes.getInt(attr);
    }
    
    public Node setDoubleAttribute(String attr, double value) {
        attributes.put(attr, value);
        return this;
    }
    
    public double getDoubleAttribute(String attr) {
        return attributes.getDouble(attr);
    }
    
    public Node setBooleanAttribute(String attr, boolean value) {
        attributes.put(attr, value);
        return this;
    }
    
    public boolean getBooleaAttribute(String attr) {
        return attributes.getBoolean(attr);
    }
    
    
    @Override
    public String toString() {
        return nodeConfig.toString(); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/OverriddenMethodBody
    }
    
    public JSONObject toJSON() {
        return nodeConfig;
    }
}

