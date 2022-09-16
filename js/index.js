'use strict';

function calculatePercentChangeArr(arr) {
    let percentChanges = [];
    if (arr.length == 0) {
        return percentChanges;
    }
    let final = arr.pop();
    while (arr.length != 0) {
        let initial = arr.pop();
        percentChanges.unshift((final / initial * 100) - 100);
        final = initial;
    }
    console.log(percentChanges)
    return percentChanges;
}

function loadResponse(resp) {
    // Regional Block
    document.getElementById("subtitle").innerHTML = 
        resp.occupation.title + ' in ' + resp.region.title;
    document.getElementById("summaryTitle").innerHTML =
        "Occupation Summary for " + resp.occupation.title;
    document.getElementById("regionalTotalJobs").innerHTML = 
        resp.summary.jobs.regional.toLocaleString();
    document.getElementById("regionalJobYear").innerHTML =
        "Jobs (" + resp.summary.jobs.year + ")";

    const regionalPercentage = resp.summary.jobs.regional / resp.summary.jobs.national_avg;
    const regionalPercent = (regionalPercentage * 100).toFixed(0);
    const regionalPreposition = (regionalPercent > 100) ? "<span class='text-success'>above</span>" : "<span class='text-danger'>below</span>";

    document.getElementById("regionalComparison").innerHTML = 
        `${regionalPercent}% ${regionalPreposition} National average`;

    // Job Growth Block
    const prefixRegionalChange = (resp.summary.jobs_growth.regional < 0) ? "" : "+";
    const textRegionalChange = (resp.summary.jobs_growth.regional < 0) ? "text-danger" : "text-success";
    const prefixNationalChange = (resp.summary.jobs_growth.national_avg < 0) ? "" : "+";
    const textNationalChange = (resp.summary.jobs_growth.national_avg < 0) ? "text-danger" : "text-success";
    document.getElementById("regionalChange").innerHTML =
        `<span class='${textRegionalChange}'>${prefixRegionalChange}${resp.summary.jobs_growth.regional}%</span>`;
    document.getElementById("regionalChangeLabel").innerHTML =
        `% Change (${resp.summary.jobs_growth.start_year}-${resp.summary.jobs_growth.end_year})`;
    document.getElementById("nationalChange").innerHTML =
        `Nation: <span class='${textNationalChange}'>${prefixNationalChange}${resp.summary.jobs_growth.national_avg}%</span>`;

    // Earnings Block
    document.getElementById("regionalEarnings").innerHTML =
        "$" + resp.summary.earnings.regional.toFixed(2) + "/hr";
    document.getElementById("nationalEarnings").innerHTML =
        "Nation: $" + resp.summary.earnings.national_avg.toFixed(2) + "/hr";

    // Regional Trends Graph
    const ctx = document.getElementById('chart').getContext('2d');
    let labels = [];
    for (let i = resp.trend_comparison.start_year+1; i <= resp.trend_comparison.end_year; i++) {
        labels.push(i);
    }
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Region",
                    pointStyle: 'rectRot',
                    pointRadius: 5,
                    data: calculatePercentChangeArr([...resp.trend_comparison.regional]) ,
                    backgroundColor: "#359",
                    borderColor: "#359"
                },
                { 
                    label: "State",
                    pointStyle: 'rect',
                    pointRadius: 5,
                    data: calculatePercentChangeArr([...resp.trend_comparison.state]),
                    backgroundColor: "#68C",
                    borderColor: "#68C"
                },
                {
                    label: "Nation",
                    pointStyle: 'triangle',
                    pointRadius: 5,
                    data: calculatePercentChangeArr([...resp.trend_comparison.nation]),
                    backgroundColor: "#9BF",
                    borderColor: "#9BF"
                }
            ]
        },
        options: {
            scales: {
                y: {
                    min: -20,
                    max: 70,
                    title: {
                        display: true,
                        text: 'Percentage Change'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Regional Trends Table
    document.getElementById("startYearJobs").innerHTML =
        resp.trend_comparison.start_year + " jobs";
    document.getElementById("endYearJobs").innerHTML =
        resp.trend_comparison.end_year + " jobs";
    
    const regionalStartYearJobs = resp.trend_comparison.regional[0];
    const regionalEndYearJobs = resp.trend_comparison.regional[resp.trend_comparison.regional.length - 1];
    
    document.getElementById("regionalStartYearJobs").innerHTML =
        regionalStartYearJobs.toLocaleString();
    document.getElementById("regionalEndYearJobs").innerHTML =
        regionalEndYearJobs.toLocaleString();
    document.getElementById("regionalChangeInJobs").innerHTML =
        (regionalEndYearJobs - regionalStartYearJobs).toLocaleString();
    document.getElementById("regional%ChangeInJobs").innerHTML =
        (regionalEndYearJobs / regionalStartYearJobs * 100 - 100).toFixed(1).toLocaleString() + "%";

    const stateStartYearJobs = resp.trend_comparison.state[0];
    const stateEndYearJobs = resp.trend_comparison.state[resp.trend_comparison.state.length - 1];
    
    document.getElementById("stateStartYearJobs").innerHTML =
        stateStartYearJobs.toLocaleString();
    document.getElementById("stateEndYearJobs").innerHTML =
        stateEndYearJobs.toLocaleString();
    document.getElementById("stateChangeInJobs").innerHTML =
        (stateEndYearJobs - stateStartYearJobs).toLocaleString();
    document.getElementById("state%ChangeInJobs").innerHTML =
        (stateEndYearJobs / stateStartYearJobs * 100 - 100).toFixed(1).toLocaleString() + "%";

    const nationalStartYearJobs = resp.trend_comparison.nation[0];
    const nationalEndYearJobs = resp.trend_comparison.nation[resp.trend_comparison.nation.length - 1];
    
    document.getElementById("nationalStartYearJobs").innerHTML =
        nationalStartYearJobs.toLocaleString();
    document.getElementById("nationalEndYearJobs").innerHTML =
        nationalEndYearJobs.toLocaleString();
    document.getElementById("nationalChangeInJobs").innerHTML =
        (nationalEndYearJobs - nationalStartYearJobs).toLocaleString();
    document.getElementById("national%ChangeInJobs").innerHTML =
        (nationalEndYearJobs / nationalStartYearJobs * 100 - 100).toFixed(1).toLocaleString() + "%";

    // Industries Table
    document.getElementById("industryTitle").innerHTML =
        "Industries Employing " + resp.occupation.title;

    for (let e of document.getElementsByClassName("industry-add-year")) {
        e.innerHTML += ` (${resp.employing_industries.year})`
    }

    for (const r of resp.employing_industries.industries) {
        const percentOfTotalJobs = (r.in_occupation_jobs / resp.employing_industries.jobs * 100).toFixed(1)
        const e = document.createElement("tr");
        e.style = 'position:relative'
        e.innerHTML = `
        <td>${r.title}</td>
        <td class="text-end">${r.in_occupation_jobs}</td>
        <td class="text-end">${percentOfTotalJobs}%</td>
        <td class="text-end">${(r.in_occupation_jobs / r.jobs * 100).toFixed(1)}%</td>
        <div class="opacity-25 h-100 position-absolute start-0 bg-primary" style="width:${percentOfTotalJobs}%"></div>`
        document.getElementById("industryTable").appendChild(e);
    }
}

function hideSpinner() {
    ;
}

function loadPage(resp) {
    if (document.readyState == 'complete') {
        loadResponse(resp);
    }
    window.onload = () => { loadPage(resp) };
}

fetch('https://run.mocky.io/v3/a2cc3707-8691-4188-8413-6183a7bb3d32').then(
    (r) => {r.text().then((t) => {loadPage(JSON.parse(t))})});