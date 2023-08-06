// window.onload
let tabSwitcher = null;
window.onload = function () {
    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.key === "m" && tabSwitcher == null) {
            chrome.runtime.sendMessage({ action: "getTabs" }, function (data) {
                console.log(data)
                tabSwitcher = document.createElement("div");
                tabSwitcher.id = "tabSwitcher";
                document.body.appendChild(tabSwitcher);
                data.tabData.forEach((tabData_) => {
                    const tabThumbnail = createTabThumbnail(tabData_);
                    tabSwitcher.appendChild(tabThumbnail);
                });

                // get tab id as attribute
                const currentTab = document.querySelector(`.tabThumbnail[tabId="${data.currentTabId}"]`);
                if(currentTab){
                    currentTab.classList.add("active");
                }
            });
        }

        if (tabSwitcher) {
            if (event.key === "ArrowRight") {
                const currentTab = document.querySelector(".tabThumbnail.active");
                const nextTab = currentTab.nextElementSibling || currentTab.parentElement.firstElementChild;
                currentTab.classList.remove("active");
                nextTab.classList.add("active");
            } else if (event.key === "ArrowLeft") {
                const currentTab = document.querySelector(".tabThumbnail.active");
                const nextTab = currentTab.previousElementSibling || currentTab.parentElement.lastElementChild;
                currentTab.classList.remove("active");
                nextTab.classList.add("active");   
            }
        }
    });

    document.addEventListener("keyup", function (event) {
        if (event.key === "Control" && tabSwitcher) {
            const currentTab = document.querySelector(".tabThumbnail.active");
            currentTab?.click();
            tabSwitcher.remove();
            tabSwitcher = null;
        }
    });

    
}

function createTabThumbnail(tabData) {

    console.log("screenshot")
    console.log(tabData.screenshot)
    const tabThumbnail = document.createElement("div");
    tabThumbnail.classList.add("tabThumbnail");
    tabThumbnail.style.backgroundImage = `url("${tabData.screenshot}")`;

    tabThumbnail.style.backgroundSize = "cover";
    tabThumbnail.style.backgroundRepeat = "no-repeat";
    tabThumbnail.style.backgroundPosition = "center";
    tabThumbnail.title = tabData.url;
    // add tab id as attribute
    tabThumbnail.setAttribute("tabId", tabData.id);

    const thumbnailWidth = 400;
    const thumbnailHeight = 300;

    const scaleFactor = Math.min(thumbnailWidth / tabData.width, thumbnailHeight / tabData.height);

    const thumbnailWidthScaled = tabData.width * scaleFactor;
    const thumbnailHeightScaled = tabData.height * scaleFactor;


    tabThumbnail.style.width = thumbnailWidthScaled + "px";
    tabThumbnail.style.height = thumbnailHeightScaled + "px";

   
    tabThumbnail.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "switchTab", tabId: tabData.id });
    });

    return tabThumbnail;
}

