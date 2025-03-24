import jsonfile from "jsonfile"
import json from "./data-backup.json" with { type: "json" };

json.instances.forEach(tei=>{
    tei.enrollments[0].events[0].dataValues.push({
        dataElement:"WvwRmFG7udm",
        value:"open"
    })
    const foundDataValue = tei.enrollments[0].events[0].dataValues.find(dv=> dv.dataElement === "nEAFd0oKJzb")
    if(foundDataValue){
        tei.attributes.push({
            attribute:"d9FXpa9ndGO",
            value: foundDataValue.value
        })
    }
    
})

jsonfile.writeFileSync("./payload.json", json)