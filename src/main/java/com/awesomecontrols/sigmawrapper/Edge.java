package com.awesomecontrols.sigmawrapper;

import java.util.UUID;
import org.json.JSONObject;

public class Edge {
    JSONObject edgeConfig = new JSONObject();
    JSONObject attributes = new JSONObject();

    public Edge(String fromNodeId, String toNodeId) {
        edgeConfig.put("source", fromNodeId);
        edgeConfig.put("target", toNodeId);
        edgeConfig.put("key", UUID.randomUUID());
        edgeConfig.put("attributes", attributes);
        
    }
    //x: number,y: number,id?: string,  label?: string, color?: string, size?: number, type?: any
    public Edge setFromNodeId(String fromNodeId) {
        edgeConfig.put("source", fromNodeId);
        return this;
    }
    
    public Edge setToNodeId(String toNodeId) {
        edgeConfig.put("target", toNodeId);
        return this;
    }
    
    public Edge setLabel(String label) {
        attributes.put("label", label);
        return this;
    }
    
    public Edge setColor(String color) {
        attributes.put("color", color);
        return this;
    }
    
    public Edge setSize(float size) {
        attributes.put("size", size);
        return this;
    }
    
    public int getSize() {
        return attributes.getInt("size");
    }
    
    public Edge setType(String type) {
        attributes.put("type", type);
        return this;
    }

    public Edge hidden(boolean hidden) {
        attributes.put("hidden", hidden);
        return this;
    }
    
    public Edge forceLabel(boolean force) {
        attributes.put("forceLabel", force);
        return this;
    }
    
    public Edge setZIndez(int zIndex) {
        attributes.put("zIndex", zIndex);
        return this;
    }
    
    public Edge setStringAttribute(String attr, String value) {
        attributes.put(attr, value);
        return this;
    }
    
    public String getStringAttribute(String attr) {
        return attributes.getString(attr);
    }

    public Edge setIntAttribute(String attr, int value) {
        attributes.put(attr, value);
        return this;
    }
    
    public int getIntAttribute(String attr) {
        return attributes.getInt(attr);
    }
    
    public Edge setDoubleAttribute(String attr, double value) {
        attributes.put(attr, value);
        return this;
    }
    
    public double getDoubleAttribute(String attr) {
        return attributes.getDouble(attr);
    }
    
    public Edge setBooleanAttribute(String attr, boolean value) {
        attributes.put(attr, value);
        return this;
    }
    
    public boolean getBooleaAttribute(String attr) {
        return attributes.getBoolean(attr);
    }
    
    public boolean hasAttribute(String attr) {
        return this.attributes.has(attr);
    }
    
    @Override
    public String toString() {
        return edgeConfig.toString(); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/OverriddenMethodBody
    }
    
    public JSONObject toJSON() {
        return this.edgeConfig;
    }
}

