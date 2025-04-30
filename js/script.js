let songs;
let currentSong;
let infoIndex = 0;
let currentsongIndex = -1;
let currentVolume = .5;
let currentsongTime = 0;
let currentsongDuration = 0;
let currentFolder = "";
let currentParsedinfo;

let playbarsongName = document.querySelector(".playbarsongName");
let playbarsingerName = document.querySelector(".playbarsingerName");
let playbarplaybtn = document.querySelector(".playbarplaybtn img");
let playbarprevbtn = document.querySelector(".previousbtn img");
let playbarnextbtn = document.querySelector(".nextbtn img");

async function fetchSongsinfo(folder) {
    let fetchedInfo = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
    let parsedInfo = await fetchedInfo.json();
    return parsedInfo;
}

async function getSongs(parsedInfo, folder) {
    let fetchedData = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
    let parsedData = await fetchedData.text();
    let div = document.createElement("div");
    div.innerHTML = parsedData;
    let anchors = div.getElementsByTagName("a");
    let link;
    songs = []
    Array.from(anchors).forEach((e) => {
        let href = e.href;
        if (href.includes(".mp3")) {
            link = e.href;
            songs.push(link);
            let songsList = document.querySelector(".songsList");
            songsList.innerHTML = songsList.innerHTML + `<li class = ${infoIndex}>
                                <div class="music flex"><img class="invert" src="images/music.svg" alt="" srcset=""></div>
                                <div class="songInfo">
                                    <div class="songName">${parsedInfo[infoIndex].songName}</div>
                                    <div class="singer">${parsedInfo[infoIndex].singer}</div>
                                </div>
                               <div class="listPlay">
                                <img class="invert" src="images/play.svg" alt="play" srcset="">
                               </div>
                              </li>`;
            parsedInfo[infoIndex].songUrl = songs[infoIndex];
            infoIndex++;
        }
    })
    return parsedInfo;
}

function pauseAndResetCurrentSong() {
    if (currentSong) {
        currentSong.pause();
        currentSong.currentTime = 0;
    }
}

function updateListPlayImage(index, src) {
    let listImage = document.querySelector(`li[class="${index}"] .listPlay img`);
    if (listImage) {
        listImage.src = src;
    }
}

function ended(parsedInfo,currentsongIndex){
    currentSong.addEventListener("ended", () => {
        if ((currentsongIndex+1) < parsedInfo.length) {
            updateListPlayImage(currentsongIndex, "images/play.svg");
            currentSong.src = `${parsedInfo[currentsongIndex + 1].songUrl}`;
            currentSong.play();
            playbarsongName.innerHTML = `${parsedInfo[currentsongIndex + 1].songName}`;
            playbarsingerName.innerHTML = `${parsedInfo[currentsongIndex + 1].singer}`;
            playbarplaybtn.src = "images/pause.svg";
            updateListPlayImage(currentsongIndex+1, "images/pause.svg");
        } else {
            updateListPlayImage(currentsongIndex, "images/play.svg");
            playbarplaybtn.src = "images/play.svg";
            pauseAndResetCurrentSong();
        }
        currentsongIndex++;
    });
}

function convertTosecs(time, duration) {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = Math.floor(time % 60);
    const durationMins = Math.floor(duration / 60);
    const durationSecs = Math.floor(duration % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    const formattedMins = String(durationMins).padStart(2, '0');
    const formattedSecs = String(durationSecs).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}/${formattedMins}:${formattedSecs} `;
}

let volumeImage = document.querySelector(".volume img");
volumeImage.addEventListener("click", () => {
    volume(currentSong);
});

document.querySelector(".volume input").addEventListener("change", (e) => {
    volumeUpdate();
});

function volume(currentSong) {
    if (currentSong) {
        if (volumeImage.src.includes("mute.svg")) {
            currentVolume = document.querySelector(".volume input").value / 100;
            volumeImage.src = "images/volume.svg";
            currentSong.volume = currentVolume;
        } else {
            currentVolume = 0;
            volumeImage.src = "images/mute.svg";
            currentSong.volume = currentVolume;
        }
    } else {
        if (volumeImage.src.includes("mute.svg")) {
            currentVolume = document.querySelector(".volume input").value / 100;
            volumeImage.src = "images/volume.svg";
        } else {
            currentVolume = 0;
            volumeImage.src = "images/mute.svg";
        }
    }
}

function volumeUpdate() {
    currentVolume = document.querySelector(".volume input").value / 100;
    if (currentSong) {
        currentSong.volume = currentVolume;
    }
}

function seekbar(duration) {
    document.querySelector(".bar").addEventListener("click", e => {
        document.querySelector(".thumb").style.left = (e.offsetX / e.target.offsetWidth) * 100 + "%";
        if (currentSong) {
            currentSong.currentTime = (((e.offsetX / e.target.offsetWidth) * 100) * duration) / 100;
        }
    })
}

async function getAudio(parsedInfo) {
    Array.from(document.querySelectorAll("li")).forEach((e) => {
        e.addEventListener("click", () => {
            let classValue = parseInt(e.className);

            if ((currentSong && currentsongIndex !== classValue)) {
                pauseAndResetCurrentSong();
                if (currentsongIndex !== -1) {
                    updateListPlayImage(currentsongIndex, "images/play.svg");
                }
            }
            if (currentsongIndex == classValue && currentSong && !currentSong.paused) {
                pauseAndResetCurrentSong();
                updateListPlayImage(currentsongIndex, "images/play.svg");
                playbarplaybtn.src = "images/play.svg";
                return;
            }
            currentsongIndex = classValue;
            currentSong = new Audio(`${parsedInfo[classValue].songUrl}`);
            currentSong.volume = currentVolume;
            currentSong.addEventListener("loadedmetadata", () => {
                currentSong.play();
                currentsongDuration = currentSong.duration;
                currentSong.addEventListener("timeupdate", (e) => {
                    currentsongTime = currentSong.currentTime;
                    let coverted = convertTosecs(currentsongTime, currentsongDuration);
                    document.querySelector(".time").innerHTML = ` <p> ${coverted}</p>`;
                    document.querySelector(".thumb").style.left = (currentsongTime / currentsongDuration) * 100 + "%";
                })
                seekbar(currentsongDuration);
            });

            if (currentsongIndex < parsedInfo.length) {
                playbarplaybtn.src = "images/pause.svg";
            }
            playbarsongName.innerHTML = `${parsedInfo[classValue].songName}`;
            playbarsingerName.innerHTML = `${parsedInfo[classValue].singer}`;
            ended(parsedInfo,currentsongIndex);
            updateListPlayImage(classValue, "images/pause.svg");
        });
    });
}

function firstSong(parsedInfo) {
    currentsongIndex = 0;
    currentSong = new Audio(`${parsedInfo[currentsongIndex].songUrl}`);
    currentSong.addEventListener("loadedmetadata", () => {
        currentSong.volume = currentVolume;
        currentSong.play();
        currentsongDuration = currentSong.duration;
        currentSong.addEventListener("timeupdate", (e) => {
            currentsongTime = currentSong.currentTime;
            let coverted = convertTosecs(currentsongTime, currentsongDuration);
            document.querySelector(".time").innerHTML = ` <p> ${coverted}</p>`;
            document.querySelector(".thumb").style.left = (currentsongTime / currentsongDuration) * 100 + "%";
        })
        seekbar(currentsongDuration);
    });
    playbarsongName.innerHTML = `${parsedInfo[currentsongIndex].songName}`;
    playbarsingerName.innerHTML = `${parsedInfo[currentsongIndex].singer}`;
    updateListPlayImage(0, "images/pause.svg");
    playbarplaybtn.src = "images/pause.svg";
    ended(parsedInfo,currentsongIndex);
}

async function playbar(parsedInfo){
    if (currentSong) {
        if (!currentSong.paused) {
            currentSong.pause();
            updateListPlayImage(currentsongIndex, "images/play.svg");
            playbarplaybtn.src = "images/play.svg";
        } else {
            currentSong.play();
            updateListPlayImage(currentsongIndex, "images/pause.svg");
            playbarplaybtn.src = "images/pause.svg";
        }
        ended(parsedInfo,currentsongIndex);
    } else {
        console.log(parsedInfo);
        firstSong(parsedInfo);
    }
}

function playbarPrev(parsedInfo){
    if (currentSong) {
        if (currentsongIndex == 0) {
            currentSong.src = `${parsedInfo[currentsongIndex].songUrl}`;
            currentSong.addEventListener("loadedmetadata", () => {
                currentSong.play();
                currentsongDuration = currentSong.duration;
                currentSong.addEventListener("timeupdate", (e) => {
                    currentsongTime = currentSong.currentTime;
                    let coverted = convertTosecs(currentsongTime, currentsongDuration);
                    document.querySelector(".time").innerHTML = ` <p> ${coverted}</p>`;
                    document.querySelector(".thumb").style.left = (currentsongTime / currentsongDuration) * 100 + "%";
                })
                seekbar(currentsongDuration);
            });
            playbarsongName.innerHTML = `${parsedInfo[currentsongIndex].songName}`;
            playbarsingerName.innerHTML = `${parsedInfo[currentsongIndex].singer}`;
            updateListPlayImage(currentsongIndex, "images/pause.svg");
            playbarplaybtn.src = "images/pause.svg";
        } else {
            currentSong.src = `${parsedInfo[currentsongIndex - 1].songUrl}`;
            currentSong.play();
            playbarsongName.innerHTML = `${parsedInfo[currentsongIndex-1].songName}`;
            playbarsingerName.innerHTML = `${parsedInfo[currentsongIndex-1].singer}`;
            updateListPlayImage((currentsongIndex - 1), "images/pause.svg");
            updateListPlayImage((currentsongIndex), "images/play.svg");
            playbarplaybtn.src = "images/pause.svg";
            currentsongIndex--;
        }
    } else {
        firstSong(parsedInfo);
    }
}

function playbarNext(parsedInfo){
    if (currentSong) {
        try {
            console.log(currentsongIndex);
            currentSong.src = `${parsedInfo[currentsongIndex + 1].songUrl}`;
            currentSong.play();
            playbarsongName.innerHTML = `${parsedInfo[currentsongIndex+1].songName}`;
            playbarsingerName.innerHTML = `${parsedInfo[currentsongIndex+1].singer}`;
            updateListPlayImage((currentsongIndex + 1), "images/pause.svg");
            updateListPlayImage((currentsongIndex), "images/play.svg");
            playbarplaybtn.src = "images/pause.svg";
            currentsongIndex++;
        } catch (error) {
            console.log("no more songs in this library " + error);
        }
    } else {
        firstSong(parsedInfo);
    }
}

let playbarClickHandler;
let playbarPrevClick;
let playbarNextClick;
async function main() {
    let parsedInfo = await fetchSongsinfo("default_songs");
    currentFolder = "default_songs";
    await updateSongList(parsedInfo, currentFolder);

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (event) => {
            currentFolder = event.currentTarget.children[2].innerHTML.replace(" ", "_").toLowerCase();
            console.log(currentFolder);
            let folderParsedInfo = await fetchSongsinfo(currentFolder);
            await updateSongList(folderParsedInfo, currentFolder);
        });
    });

    let hamburger = document.querySelector(".heading").lastElementChild;
    hamburger.addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });
    document.querySelector(".close").children[0].addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    async function updateSongList(parsedInfo, folder) {
        infoIndex = 0;
        currentsongIndex = -1;
        document.querySelector(".songsList").innerHTML = "";
        let currentParsedinfo = await getSongs(parsedInfo, folder);
        await getAudio(currentParsedinfo);

        playbarClickHandler = function () {
            playbar(currentParsedinfo);
        };

        playbarPrevClick = function () {
            playbarPrev(currentParsedinfo);
        };
       
        playbarNextClick = function () {
                playbarNext(currentParsedinfo);
            };
        }

        playbarplaybtn.addEventListener("click",()=>{
            playbarClickHandler();
        });
        playbarprevbtn.addEventListener("click",()=>{
            playbarPrevClick();
        });

        playbarnextbtn.addEventListener("click",()=>{
            playbarNextClick();
        });
}

main();