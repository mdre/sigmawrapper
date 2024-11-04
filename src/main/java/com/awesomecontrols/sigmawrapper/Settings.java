package com.awesomecontrols.sigmawrapper;

import org.json.JSONObject;

public class Settings {
    JSONObject settings = new JSONObject();
    
    public Settings() {
    }

    // Performance
    public Settings hideEdgesOnMove(boolean b) {
        settings.put("hideEdgesOnMove", b);
        return this;
    }
    
    public Settings hideLabelsOnMove(boolean b) {
        settings.put("hideLabelsOnMove", b);
        return this;
    }

    public Settings renderLabels(boolean b) {
        settings.put("renderLabels", b);
        return this;
    }
    
    public Settings renderEdgeLabels(boolean b) {
        settings.put("renderEdgeLabels", b);
        return this;
    }
    
    public Settings enableEdgeEvents(boolean b) {
        settings.put("enableEdgeEvents", b);
        return this;
    }
    

    // Component rendering
    public Settings defaultNodeColor(String color) {
        settings.put("defaultNodeColor", color);
        return this;
    }
    
    public Settings defaultNodeType(String type) {
        settings.put("defaultNodeType", type);
        return this;
    }

    public Settings defaultEdgeColor(String color) {
        settings.put("defaultEdgeColor", color);
        return this;
    }

    public Settings defaultEdgeType(String type) {
        settings.put("defaultEdgeType", type);
        return this;
    }

    public Settings labelFont(String font) {
        settings.put("labelFont", font);
        return this;
    }

    public Settings labelSize(int size) {
        settings.put("labelSize", size);
        return this;
    }

    public Settings labelWeight(String weight) {
        settings.put("labelWeight", weight);
        return this;
    }

    public Settings labelColor(String labelColor) {
        JSONObject color = new JSONObject();
        color.put("color", labelColor);
        settings.put("labelColor", color.toString());
        return this;
    }

    public Settings edgeLabelFont(String font) {
        settings.put("edgeLabelFont", font);
        return this;
    }

    public Settings edgeLabelSize(int size) {
        settings.put("edgeLabelSize", size);
        return this;
    }

    public Settings edgeLabelWeight(String weight) {
        settings.put("edgeLabelWeight", weight);
        return this;
    }

     public Settings edgeLabelColor(String labelColor) {
        JSONObject color = new JSONObject();
        color.put("attribute", labelColor);
        settings.put("edgeLabelColor", color.toString());
        return this;
    }

    public Settings stagePadding(int padding) {
        settings.put("stagePadding", padding);
        return this;
    }

    public Settings defaultDrawEdgeLabel(Object function) {
        settings.put("defaultDrawEdgeLabel", function);
        return this;
    }

    public Settings defaultDrawNodeLabel(Object function) {
        settings.put("defaultDrawNodeLabel", function);
        return this;
    }

    public Settings defaultDrawNodeHover(Object function) {
        settings.put("defaultDrawNodeHover", function);
        return this;
    }

    public Settings minEdgeThickness(double thickness) {
        settings.put("minEdgeThickness", thickness);
        return this;
    }

    public Settings antiAliasingFeather(double feather) {
        settings.put("antiAliasingFeather", feather);
        return this;
    }

    // Mouse and touch settings
    public Settings dragTimeout(int timeout) {
        settings.put("dragTimeout", timeout);
        return this;
    }

    public Settings draggedEventsTolerance(int tolerance) {
        settings.put("draggedEventsTolerance", tolerance);
        return this;
    }

    public Settings inertiaDuration(int duration) {
        settings.put("inertiaDuration", duration);
        return this;
    }

    public Settings inertiaRatio(int ratio) {
        settings.put("inertiaRatio", ratio);
        return this;
    }

    public Settings zoomDuration(int duration) {
        settings.put("zoomDuration", duration);
        return this;
    }

    public Settings zoomingRatio(double ratio) {
        settings.put("zoomingRatio", ratio);
        return this;
    }

    public Settings doubleClickTimeout(int timeout) {
        settings.put("doubleClickTimeout", timeout);
        return this;
    }

    public Settings doubleClickZoomingRatio(double ratio) {
        settings.put("doubleClickZoomingRatio", ratio);
        return this;
    }

    public Settings doubleClickZoomingDuration(int duration) {
        settings.put("doubleClickZoomingDuration", duration);
        return this;
    }

    // Size and scaling
    public Settings zoomToSizeRatioFunction(Object function) {
        settings.put("zoomToSizeRatioFunction", function);
        return this;
    }

    public Settings itemSizesReference(String reference) {
        settings.put("itemSizesReference", reference);
        return this;
    }

    public Settings autoRescale(boolean rescale) {
        settings.put("autoRescale", rescale);
        return this;
    }

    public Settings autoCenter(boolean center) {
        settings.put("autoCenter", center);
        return this;
    }

    // Labels
    public Settings labelDensity(double density) {
        settings.put("labelDensity", density);
        return this;
    }

    public Settings labelGridCellSize(int size) {
        settings.put("labelGridCellSize", size);
        return this;
    }

    public Settings labelRenderedSizeThreshold(int threshold) {
        settings.put("labelRenderedSizeThreshold", threshold);
        return this;
    }

    // Reducers
    public Settings nodeReducer(Object reducer) {
        settings.put("nodeReducer", reducer);
        return this;
    }

    public Settings edgeReducer(Object reducer) {
        settings.put("edgeReducer", reducer);
        return this;
    }

    // Features
    public Settings zIndex(boolean zIndex) {
        settings.put("zIndex", zIndex);
        return this;
    }

    public Settings minCameraRatio(Double ratio) {
        settings.put("minCameraRatio", ratio);
        return this;
    }

    public Settings maxCameraRatio(Double ratio) {
        settings.put("maxCameraRatio", ratio);
        return this;
    }

    public Settings enableCameraRotation(boolean enable) {
        settings.put("enableCameraRotation", enable);
        return this;
    }

    // Lifecycle
    public Settings allowInvalidContainer(boolean allow) {
        settings.put("allowInvalidContainer", allow);
        return this;
    }

    // Program classes
    public Settings nodeProgramClasses(JSONObject classes) {
        settings.put("nodeProgramClasses", classes);
        return this;
    }

    public Settings nodeHoverProgramClasses(JSONObject classes) {
        settings.put("nodeHoverProgramClasses", classes);
        return this;
    }

    public Settings edgeProgramClasses(JSONObject classes) {
        settings.put("edgeProgramClasses", classes);
        return this;
    }
    
    @Override
    public String toString() {
        return settings.toString();
    }
    
    public JSONObject toJSON() {
        return settings;
    }
}