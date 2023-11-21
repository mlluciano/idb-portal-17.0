import React, {useState} from 'react'
import fields from '../../lib/fields'
import _ from 'lodash'
import dqFlags from '../../lib/dq_flags'
const keys = Object.keys(fields.byDataTerm);
import Contacts from "./shared/contacts";
import Raw from "./shared/raw"
import 'tablesorter/dist/css/theme.blue.min.css'

var missing={};
var stotal=0,mtotal=0;
var formatNum = function(num){
    if (typeof num != "undefined") {
        return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return "0"
    }
}

const Total = ({total}) => {
    return (
        <span>{formatNum(total)}</span>
    )
};

const Flagrow = ({value, name, uuid, total}) => {

    function checkVal(val){
        if(_.isNaN(val)||val==='NaN'){
            return '-';
        }else{
            return val;
        }
    }

    var style = {'width': (value-2)+'px'};
    var sty2 = {'width': '170px'};
    return (
        <tr>
            <td>
                <b>
                    <a href={'/portal/search?rq={"flags":"'+name+'","recordset":"'+uuid+'"}'}>
                        {name}
                    </a>
                </b>
                &nbsp;&nbsp;<span className="badge" title={dqFlags[name]} data-toggle="tooltip">i</span>
            </td>
            <td style={sty2} className="value-column record-count">{checkVal(total)}</td>
            <td className="value-column">
                <div className="perc-box">
                    <span className="perc-bar" style={style}>

                    </span>
                    <span className="perc-text">
                        {checkVal(value)}
                    </span>
                </div>
            </td>
        </tr>
    );

};

const FlagsTable = ({active, flags, uuid, stotal}) => {

    var flagrows = _.map(Object.keys(flags),function(flag){
        var perc = Number(((100/stotal) * flags[flag].itemCount).toFixed(3));
        return <Flagrow key={flag} name={flag} total={flags[flag].itemCount} value={perc} uuid={uuid} />
    });

    if(flagrows.length === 0){
        flagrows.push(
            <tr><td colSpan="3" style={{"textAlign":"center","fontWeight":"bold"}}>No Flags for this Recordset</td></tr>
        )
    }

    var sty = {'textAlign': 'center'};
    return (
        <div id="flags-table" style={{display: (active ? 'block':'none')}} className="stat-table clearfix" >

            <div className="blurb">This table shows any data corrections that were performed on this recordset to improve the capabilities of iDigBio <a href="/portal/search">Search</a>. The first column represents the correction performed. The last two columns represent the number and percentage of
             records that were corrected. A complete list of the data quality flags and their descriptions can be found <a alt="flag descriptions" href="https://github.com/iDigBio/idigbio-search-api/wiki/Data-Quality-Flags">here</a>. Clicking on a data flag name will
             take you to a search for all records with this flag in this recordset.</div>
            <table className="table table-condensed pull-left tablesorter-blue" id="table-fields">
                <thead>
                    <tr>
                        <th>Flag</th>
                        <th>Records With This Flag</th>
                        <th style={sty}>(%) Percent With This Flag</th>
                    </tr>
                </thead>
                <tbody>
                    {flagrows}
                </tbody>
            </table>
        </div>
    );

};

const UseTable = ({uuid, use, active}) => {

    var rows=[]

    if(_.isEmpty(use.dates) === false){
        _.each(use.dates,function(val,key){
            var r = val[uuid];

            var date=key.substring(5,7)+' / '+key.substring(0,4);

            rows.push(
                <tr key={key}>
                    <td>{date}</td>
                    <td className="value">{formatNum(r.search)}</td>
                    <td className="value">{formatNum(r.download)}</td>
                    <td className="value">{formatNum(r.seen)}</td>
                    <td className="value">{formatNum(r.viewed_records)}</td>
                    <td className="value">{formatNum(r.viewed_media)}</td>
                </tr>
            )
        })
    }else{
        rows.push(
            <tr key="none">
                <td colSpan="6" style={{textAlign: "center", fontWeight: "bold"}}>
                    No Use Data for this Recordset
                </td>
            </tr>
        )
    }

    return (
        <div id="use-table" style={{display: (active ? 'block':'none')}} className="stat-table clearfix">

            <div className="clearfix">
                The table below represents monthly iDigBio portal use statistics for this recordset. <em><b>Search</b></em> indicates in how many instances a record from this recordset matched a search query. <em><b>Download</b></em> indicates in how many instances a record from this recordset was downloaded. <em><b>Seen</b></em> indicates in how many instances a record from this recordset appeared (visually) in the search results in a browser window.
                 &nbsp;<em><b>Records Viewed</b></em> and <em><b>Media Viewed</b></em> indicate how many specimen and media records were opened and viewed in full detail.
                Note: Monthly statistics aggregation began on Jan 15th 2015; therefore, the month of (01 / 2015) represents approximately half a month of statistics reporting.
            </div>
            <table className="table table-condensed pull-left tablesorter-blue" id="table-use">
                <thead><tr><th>Month of</th><th>Search</th><th>Download</th><th>Seen</th><th>Records Viewed</th><th>Media Viewed</th></tr></thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    )

};

const RawView = ({active, raw}) => {

    function formatJSON(json){
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    return (
        <div id="raw" style={{display: (active ? 'block' : 'none' )}} className="stat-table clearfix">
            <p id="raw-body" dangerouslySetInnerHTML={{__html: formatJSON(raw)}}>
            </p>
        </div>
    )

};

const StatsTables = ({flags, stotal, uuid, use, raw}) => {
    const [active, setActive] = useState('flags')

    function click(e){
        e.preventDefault();
        setActive(e.currentTarget.attributes['data-active'].value)
    }

    return (
        <div id="stats-tables" className="clearfix scrollspy">
            <ul className="tabs" id="stats-tabs">
                <li className={active == 'flags' ?  'active': ''} id="corrected-tab" onClick={click} data-active="flags">Data Corrected</li>
                <li className={active == 'use' ?  'active': ''} id="use-tab" onClick={click} data-active="use">Data Use</li>
                <li className={active == 'raw' ?  'active': ''} id="raw-tab" onClick={click} data-active="raw">Raw</li>
            </ul>
            <FlagsTable active={active=='flags'} flags={flags} stotal={stotal} uuid={uuid} />
            <UseTable active={active=='use'} use={use} uuid={uuid} />
            <RawView active={active=='raw'} raw={raw}/>
        </div>
    )

};

const Title = ({keyid}) => {

    return(
        <h1 id="title">{keyid}</h1>
    );

};

const Description = ({data}) => {

    function errorImage(e){
        e.target.attributes['src'].value = '';
    }

    var logo = '';
    if(_.has(data, 'logo_url') && !_.isEmpty(data.logo_url)){
        logo = <img className="logo" src={data.logo_url} onError={errorImage} />
    }
    //decode html characters that appear in some descriptions
    var desc = _.unescape(data.collection_description);
    return(
        <div id="description" className="scrollspy">
            <p className="clearfix">
            {logo}
            <span>
                {desc}
            </span>
            </p>
        </div>
    )

};

const Last = ({keyid}) => {

   return(<span>{keyid}</span>);

};



const RecordsetModExports = ({recordset, lastmodified, stotal, mtotal, use, flags}) => {

    function navList(){

        return(
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#description">Description</a></li>
                <li><a href="#contacts">Contacts</a></li>
                <li><a href="#stats-tables">All Data</a></li>
            </ul>            
        );
    }

    var raw = recordset;
    var data = raw.data;
    var id = raw.uuid;
    var lastupdate = data.update.substring(0,10);
    var datemodified = raw.indexTerms.datemodified.substring(0,10);
    var search = '/portal/search?rq={"recordset":"'+id+'"}';
    var web = null;

    if(_.has(raw.data,'institution_web_address' && ! _.isEmpty(raw.data.institution_web_address))){
        web = (
            <div>
                <h2 className="title">Collection Home Page</h2>
                <a href={raw.data.institution_web_address}>{raw.data.institution_web_address}</a>
            </div>
        )
    }

    var counts = (
        <div className="row">
            <div className="col-sm-5 info">
                    Specimen Records:&nbsp;<Total key={'Specimen'} keyid={'Specimen'} total={formatNum(stotal)} /><br />
            </div>
            <div className="col-sm-5 info">
                    Media Records:&nbsp;<Total key={'Media'} keyid={'Media'} total={formatNum(mtotal)} />
            </div>
            <div className="col-sm-12 info">
                iDigBio Last Ingested Date:&nbsp;<Last key={lastmodified+'lastmodified'} keyid={lastmodified} />
            </div>
        </div>
    );


    return (
        <div className="container-fluid">
            <div className="row">
                <div id="content" className="col-lg-7 col-lg-offset-2 col-md-10 col-sm-10">
                    <h1 id="banner" className="pull-left">Recordset</h1>
                    <a id="search-button" className="pull-right" href={search}>Search Recordset</a>
                    <Title key={data.collection_name} keyid={data.collection_name} />
                    {counts}
                    <Description data={data} />
                    {web}
                    <Contacts data={data} />
                    <StatsTables uuid={raw.uuid} raw={raw} use={use} flags={flags} stotal={stotal}/>
                </div>
                <div className="col-lg-2 col-md-2 col-sm-2">
                    <div id="side-nav">
                        {navList()}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default RecordsetModExports;
