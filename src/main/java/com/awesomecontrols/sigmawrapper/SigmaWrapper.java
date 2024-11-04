package com.awesomecontrols.sigmawrapper;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.HasComponents;
import com.vaadin.flow.component.HasSize;
import com.vaadin.flow.component.HasStyle;
import com.vaadin.flow.component.HasTheme;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.template.Id;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONObject;

@Tag("sigma-wrapper")
@NpmPackage(value = "sigma", version = "3.0.0-beta.29")
@NpmPackage(value = "@sigma/edge-curve", version = "3.0.0-beta.14")
@NpmPackage(value = "@sigma/node-image", version = "3.0.0-beta.12")
@NpmPackage(value = "@sigma/node-border", version = "3.0.0-beta.4")
@NpmPackage(value = "@sigma/node-square", version = "3.0.0-beta.1")
@NpmPackage(value = "@sigma/layer-webgl", version = "3.0.0-beta.1")
@NpmPackage(value = "graphology", version = "0.25.4")
@NpmPackage(value = "graphology-layout-forceatlas2", version = "0.10.1")
@NpmPackage(value = "graphology-communities-louvain", version = "2.0.1")
@JsModule("./sigmawrapper/sigma-wrapper.ts")
public class SigmaWrapper extends Component implements HasTheme, HasStyle, HasComponents, HasSize {

    /**
     *
     */
    private final static long serialVersionUID = 5630472247035116755L;

    private final static Logger LOGGER = Logger.getLogger(SigmaWrapper.class.getName());
    static {
        if (LOGGER.getLevel() == null) {
            LOGGER.setLevel(Level.FINEST);
        }
    }
    boolean ready = false;
    
    @Id("toolbar")
    Div toolbar;
    
    Settings settings;
    
    /**
     */
    public SigmaWrapper() {
    }
    
    public SigmaWrapper(Settings settings) {
    }
    
    public SigmaWrapper initialize() {
        LOGGER.log(Level.FINEST, "send config and initialize...");
        getElement().callJsFunction("initialize", settings.toString());
        return this;
    }

    public SigmaWrapper addNode(double x, double y) {
        getElement().callJsFunction("addNode",new Node(x,y).toString());
        return this;
    }

    public SigmaWrapper addNode(Node n) {
        getElement().callJsFunction("addNode", n.toString());
        return this;
    }
    
    public SigmaWrapper addEdge(Edge e) {
        getElement().callJsFunction("addEdge", e.toString());
        return this;
    }
    
    public SigmaWrapper forceAtlas2() {
        getElement().callJsFunction("forceAtlas2");
        return this;
    }
    
    public SigmaWrapper forceAtlas2(int iterations) {
        getElement().callJsFunction("forceAtlas2", iterations);
        return this;
    }
    
    public SigmaWrapper curveEdges() {
        getElement().callJsFunction("curveEdges");
        return this;
    }
    
    public SigmaWrapper exportGraphData() {
        getElement().callJsFunction("export");
        return this;
    }
    
    public SigmaWrapper importGraphData(JSONObject data) {
        getElement().callJsFunction("import", data.toString());
        return this;
    }
    
    public SigmaWrapper bigBangLayout(int iterations) {
        getElement().callJsFunction("bigBangLayout", iterations);
        return this;
    }
    
    public Div getToolbar() {
        return toolbar;
    }
}
