
import React, {useEffect, useState} from 'react';
import Filters from './search/filters'
import Sorting from './search/sorting'
import Mapping from './search/mapping'
import Results from './search/results'
import Download from './search/download'
import Map from './search/map'



import paramsParser from './search/lib/params_parser'

const Search = () => {
    const [optionsTab, setOptionsTab] = useState('filters')
    const [resultsTab, setResultsTab] = useState('list')
    const [search, setSearch] = useState(defaultSearch())
    function defaultSearch(){
        return {
            filters: Filters.defaultFilters(),
            fulltext:'',
            image:false,
            geopoint:false,
            sorting: Sorting.defaultSorts(),
            from: 0,
            size: 100,
            mapping: {
                type: "box",
                bounds:{
                    top_left:{
                        lat: false,
                        lon: false
                    },
                    bottom_right: {
                        lat: false,
                        lon: false
                    }
                }   
            }
        };
    }

    useEffect(() => {
        const currentSearch = defaultSearch()
        if (url('?rq') || url('?sort')) {

            paramsParser(currentSearch); // mutates search object filters
            _.each(
                _.difference(_.map(Filters.defaultFilters(), 'name'), _.map(currentSearch.filters, 'name')),
                function (filter) {
                    currentSearch.filters.push(Filters.newFilterProps(filter));
                }
            );
        } else if (searchHistory.length > 0) {
            currentSearch.filters = _.map(searchHistory.history[0].filters, function (filter) {
                return Filters.newFilterProps(filter.name);
            });
        }
        window.history.replaceState({}, 'search', url('path'));
        // setHistory([...history, currentSearch])
        searchHistory.push(currentSearch);
        // Update the state with 'search'
        setSearch(currentSearch)
    }, []);
    
    function searchChange(key,val){
        var newSearch = _.cloneDeep(search);
        if(typeof key == 'string'){
            newSearch[key]=val;
        }else if(typeof key == 'object'){
            _.each(key,function(v,k){
                newSearch[k]=v;
            });
        }
        setSearch(newSearch)
        // setHistory([...history, search])
        searchHistory.push(newSearch);
    }

    function viewChange(view,option){
        //currently only supports options panel and results tabs
        if(view=='optionsTab'){
            localStorage.setItem(view, option);
            setOptionsTab(option)
        } else if (view=='resultsTab') {
            localStorage.setItem(view, option);
            setResultsTab(option)
        }
    }

    return(
        <div id='react-wrapper'>
            <div id="top" className="clearfix">
                <div id="search" className="clearfix">
                    <SearchAny search={search} searchChange={searchChange} />
                    <OptionsPanel search={search} searchChange={searchChange} view={optionsTab} viewChange={viewChange} />
                </div>
                <Map search={search} searchChange={searchChange} viewChange={viewChange}/>
            </div>
            <Results search={search} searchChange={searchChange} view={resultsTab} viewChange={viewChange}/>
        </div>
    )

};
// var Main = new Search()
class SearchAny extends React.Component{
    openHelp(){

    }

    constructor(props) {
        super(props)
        this.textType = this.textType.bind(this)
        this.checkClick = this.checkClick.bind(this)
        this.resetSearch = this.resetSearch.bind(this)
    }
     
    checkClick(event){
        this.props.searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    }
    textType(event){
        this.props.searchChange('fulltext',event.currentTarget.value);
    }
    resetSearch(){ 
        this.props.searchChange(Search.defaultSearch());
    }
    render(){

        return(
            <div id="search-any" className="clearfix">
                <h3>
                    Search Records

                    <a className="btn pull-right" id="reset-button" onClick={this.resetSearch} title="reset search form">Reset</a>
                    <a className="btn pull-right" title="help" data-toggle="modal" data-target="#search-help">Help</a>
                </h3>
                <div >
                    <input type="text" className="form-control" placeholder="search all fields" onChange={this.textType} value={this.props.search.fulltext}/>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="image" onChange={this.checkClick} checked={this.props.search.image}/>
                        Must have media
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="geopoint" onChange={this.checkClick} checked={this.props.search.geopoint}/>
                        Must have map point
                    </label>
                </div>
                <div id="search-help" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close pull-right" data-dismiss="modal">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h3>Search Help</h3>
                            </div>
                            <div className="modal-body">
                                <ul>
                                    <li>
                                        This search page is reactive to input and will execute a search the moment you interact with the form inputs.
                                    </li>
                                    <li>
                                        Full text searches across all data fields can be executed with the "search all fields" box at the top of the search form.
                                    </li>
                                    <li>
                                        Check the <b>Must have media</b> and <b>Must have map point</b> checkboxes to only show records with media and/or mapping data respectively.
                                    </li>
                                    <li> 
                                        Use the field <em>Filters</em> tab to add exact match terms on a per field basis to your search.
                                        A filter can also be used to simply select the presence or absence of a field in a record with
                                        the <b>Present</b> and <b>Missing</b> checkboxes.
                                    </li>
                                    <li>
                                        Use the <em>Sorting</em> tab to add multiple sort values to the search.
                                    </li>
                                    <li>
                                        Use the <em>Mapping</em> tab to add geographic bounding coordinates to your search.
                                    </li>
                                    <li>
                                        Use the <em>Download</em> tab to access your search history and to download the current search results.
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class OptionsPanel extends React.Component{
    /*getInitialState: function(){
        if(localStorage && typeof localStorage.panels ==='undefined'){
            localStorage.setItem('panels','filters');
        }
        return {panels: localStorage.getItem('panels')}
    },*/
    constructor(props) {
        super(props)
        this.optionPanel = this.optionPanel.bind(this)
        this.showPanel = this.showPanel.bind(this)
    }

    showPanel(event){
        event.preventDefault();
        event.stopPropagation();
        var val = event.currentTarget.attributes['data-panel'].value;
        /*this.setState({panels: val},function(){
            localStorage.setItem('panels',val);
        })*/
        this.props.viewChange('optionsTab',val);
    }
    optionPanel(name){
        switch(name){
            case 'filters':
                return <Filters searchChange={this.props.searchChange} search={this.props.search} filters={this.props.search.filters} active="active"/>;
                break;
            case 'sorting':
                return <Sorting searchChange={this.props.searchChange} sorting={this.props.search.sorting} active="active"/>;
                break;
            case 'mapping':
                return <Mapping searchChange={this.props.searchChange} mapping={this.props.search.mapping} active="active"/>;
                break;
            case 'download':
                return <Download search={this.props.search} searchChange={this.props.searchChange} active="active"/>;
                break;
        }
    }
    render(){
    
        var menu = [],self=this,panels={filters: '', mapping: '',sorting: '', download:''},panel;

        Object.keys(panels).forEach(function(item,ind){
            if(item==self.props.view){
                panels[item]='active';
                panel = self.optionPanel(item);
            }else{
                panels[item]='';
            }
            menu.push(
                <li key={ind} className="tab">
                    <a className={panels[item]} href="#" onClick={self.showPanel} data-panel={item}>{helpers.firstToUpper(item)}</a>
                </li>
            )
        })
        //var filters = React.createFactory(Filters);
        return (
            <div id="options" className="clearfix">
                <ul id="options-menu" >
                    {menu}
                </ul>
                {panel}
            </div>
        )
    }
}
export default Search;