package webapp.com.vaadintest;

import com.awesomecontrols.sigmawrapper.SigmaWrapper;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.router.Route;

@Route("")
public class VaadinTestLab extends Div {

    public VaadinTestLab() {
        this.setSizeFull();
        SigmaWrapper sw = new SigmaWrapper();
        Button b = new Button("addNode", (e)->{sw.addNode(0.5,0.5);});
        add(b);
        add(sw);
        sw.initialize();
        sw.setSizeFull();
        
    }
}
