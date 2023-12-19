window.addEventListener('DOMContentLoaded', () => {
    const jobListingsWrapper = document.querySelector('.job-listings'),
    searchTagsWrapper = document.querySelector('.search-tags'),
    elSearchClear = document.querySelector('.search-clear'),
    elSearchPanelWrapper = document.querySelector('.search-panel-wrapper');
    
    let jobListings = [];
    let filterJobListings = new Set();
    
    fetch('http://localhost:3000/joblistings')
    .then(res => res.json())
    .then(data => {
        // jobListings = JSON.parse(JSON.stringify(data))
        jobListings = data
        filterJobs()
    })
    
    if (elSearchClear) {
        elSearchClear.addEventListener('click', () => {
            filterJobListings.clear()
            filterJobs()
        })
    }
    
    function filterJobs() {
        if (filterJobListings.size === 0) {
            elSearchPanelWrapper.classList.add('hide')
            elSearchPanelWrapper.classList.remove('show', 'fade')
            const renderedFilterTags = renderFilterTags([...filterJobListings])
            searchTagsWrapper.replaceChildren(...renderedFilterTags)
            const renderedJobListings = renderJobListings(jobListings)
            jobListingsWrapper.replaceChildren(...renderedJobListings)
            return
        }
        elSearchPanelWrapper.classList.add('show', 'fade')
        elSearchPanelWrapper.classList.remove('hide')
        const renderedFilterTags = renderFilterTags([...filterJobListings])
        searchTagsWrapper.replaceChildren(...renderedFilterTags)
        const filteredJobListings = jobListings.filter(({keywords}) => {
            if ([...filterJobListings].every((item) =>keywords.includes(item))) {
                return true
            };
        })
        const renderedJobListings = renderJobListings(filteredJobListings)
        jobListingsWrapper.replaceChildren(...renderedJobListings)
    }
    
    
    function renderFilterTags(arr) {
        return arr.map((item) => {
            const elLi = document.createElement('li')
            elLi.classList.add('search-tag')
            elLi.innerHTML = `
            <div class="search-tag-title">${item}</div>
            <span class="search-tag-close"></span>
            `
            elLi.addEventListener('click', () => {
                filterJobListings.delete(item)
                filterJobs()
            })
            
            return elLi;
        })
    }
    
    
    function renderJobListings(jobs) {
        return jobs.map(({logo, companyName, title, postedTime, modeJob, placeOfWork, keywords, top}) => {
            const elLi = document.createElement('li')
            elLi.classList.add("job-listings-item")
            top && elLi.classList.add("job-listings-item-featured")
            elLi.innerHTML = `
            <img class="job-listings-logo" src=${logo} alt=${companyName} height="88" width="88" />
            <div class="job-listings-info">
            <div class="job-listings-company-badges">
            <h4 class="job-listings-company-name">${companyName}</h4>
            <div class="job-listings-badges">
            ${isNew() ? `<span class="job-listings-badges-item badge badge-green">new!</span>` : ""}
            ${top ? `<span class="job-listings-badges-item badge badge-black">featured</span>`: ""}
            </div>
            </div>
            <h3 class="job-listings-position"><a href="#" class="job-listings-link">${title}</a></h3>
            <ul class="job-listings-addl">
            <li class="job-listings-addl-item">${getTime(postedTime)}</li>
            <li class="job-listings-addl-item">${modeJob}</li>
            <li class="job-listings-addl-item">${placeOfWork}</li>
            </ul>
            </div>
            <ul class="job-listings-tags"></ul>
            `


            function isNew() {
                switch (getTime(postedTime)) {
                    case "1d ago":
                    case "2d ago":
                    case "3d ago":
                        return true
                    default:
                        return false
                }
            }
            
            function renderJobTags(arr) {
                return arr.map(item => {
                    const elLi = document.createElement('li')
                    elLi.classList.add('job-listings-tags-item', 'tag')
                    elLi.textContent = item
                    
                    elLi.addEventListener('click', () => {
                        filterJobListings.add(item)
                        filterJobs()
                    })
                    return elLi;
                })
            }
            
            const jobTags = renderJobTags(keywords)
            elLi.querySelector('.job-listings-tags').replaceChildren(...jobTags)
            
            return elLi;
        })
    }
    
    function getTime(postedDate) {
        let totalSeconds, totalMinutes, totalHours, days, seconds, minutes, hours;
        
        const timer =  Date.parse(new Date()) - Date.parse(postedDate);
        
        totalSeconds = Math.floor(timer / 1000),
        totalMinutes = Math.floor(totalSeconds / 60),
        totalHours = Math.floor(totalMinutes / 60),
        days = Math.floor(totalHours / 24)

        if(days === 0) {
            return "today";
        }

        if(days >= 7) {
            if(parseInt(days / 7) >= 4) {
                if(parseInt(days / 30) > 12) {
                    return `${parseInt(days / 365)}y ago`
                }
                return `${parseInt(days / 30)}m ago`
            }
            return `${parseInt(days / 7)}w ago`;
        }
        
        return `${days}d ago`;
    }
})