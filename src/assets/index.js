import metadata from "./metadata-package.json" with { type: "json" };
import jsonfile from "jsonfile"
delete metadata.programs[0].createdBy;
delete metadata.programs[0].lastUpdatedBy;
delete metadata.programs[0].created;
delete metadata.programs[0].lastUpdated;
delete metadata.programs[0].categoryCombo;

metadata.programs[0].programTrackedEntityAttributes.forEach(ptea=>{
    delete ptea.created;
    delete ptea.lastUpdated;

});
metadata.programTrackedEntityAttributes.forEach(ptea=>{
    delete ptea.created;
    delete ptea.lastUpdated;

});
metadata.programStageDataElements.forEach(psde=>{
    delete psde.created;
    delete psde.lastUpdated;

});

delete metadata.categoryCombos;
delete metadata.categoryOptions;
delete metadata.categories;
delete metadata.categoryOptionCombos;


metadata.options.forEach(option=>{
    delete option.translations;
    delete option.created;
    delete option.lastUpdated;
});
metadata.optionSets.forEach(os=>{
    delete os.translations;
    delete os.created;
    delete os.lastUpdated;
    delete os.createdBy;
    delete os.lastUpdatedBy;
});
metadata.programStages.forEach(ps=>{
    delete ps.created;
    delete ps.lastUpdated;
    delete ps.createdBy;
    delete ps.lastUpdatedBy;
});
metadata.programStages.forEach(ps=>{
    ps.programStageDataElements.forEach(psde=>{
        delete psde.created;
        delete psde.lastUpdated;

    })
});
metadata.trackedEntityTypes.forEach(tet=>{
    delete tet.created;
    delete tet.lastUpdated;
    delete tet.createdBy;
    delete tet.lastUpdatedBy;
});

metadata.trackedEntityTypes.forEach(tet=>{
    tet.trackedEntityTypeAttributes.forEach(teta=>{
        delete teta.created;
        delete teta.lastUpdated;    
    })
});
metadata.dataElements.forEach(de=>{
    delete de.created;
    delete de.lastUpdated;
    delete de.createdBy;
    delete de.lastUpdatedBy;
    delete de.categoryCombo
});
metadata.trackedEntityAttributes.forEach(tea=>{
    delete tea.created;
    delete tea.lastUpdated;
    delete tea.createdBy;
    delete tea.lastUpdatedBy;
    delete tea.translations;
});
jsonfile.writeFileSync("./payload.json", metadata)