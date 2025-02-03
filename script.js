const play = document.querySelector(".play");
let currentsong = new Audio();
const player = document.getElementById("play");
let songs;
let currFolder;

// Converting seconds to the time format provided in player
function convertSecondsToTimeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "invalid output";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinutes} : ${formatedSeconds}`;
}

async function getSong(folder) {
    currFolder = folder;
        let url = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let response = await url.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        const elem = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < elem.length; index++) {
            const element = elem[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href);
            }
        }

        // Parsing all songs into playlist
        let songListUl = document.querySelector(".lists").getElementsByTagName("ul")[0];
        songListUl.innerHTML = ''; // Clear previous list
        for (const song of songs) {
            songListUl.innerHTML += `
                <li>
                    <img class="invert" src="public/music.svg" alt="">
                    <div class="info">
                        <div>${decodeURI(song).split("/").pop()}</div>
                        <div class="">Bhayiya ji</div>
                    </div>
                    <img class="invert" src="public/play.svg" alt="">
                </li>`;
        }

        // Attaching event listener to all li elements
        Array.from(songListUl.getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => {
                const songPath = songs[index]; // Get the full song path from the songs array
                playMusic(songPath); // Play the song using the full path
            });
        });

        return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = track;
    if (!pause) {
        currentsong.play();
        player.src = "public/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.split("/").pop());
    document.querySelector(".songtime").innerHTML = "00 : 00 / 00 : 00";
};

async function main() {
    // Get all songs
    songs = await getSong("songs/garhwali");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    // Attach an event listener to play, next, and previous buttons
    player.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            player.src = "public/pause.svg";
        } else {
            currentsong.pause();
            player.src = "public/play.svg";
        }
    });

    currentsong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToTimeFormat(currentsong.currentTime)} / ${convertSecondsToTimeFormat(currentsong.duration)}`;
    });

    currentsong.addEventListener("timeupdate", () => {
        if (!isNaN(currentsong.currentTime) && !isNaN(currentsong.duration)) {
            document.querySelector(".songtime").innerHTML = `${convertSecondsToTimeFormat(currentsong.currentTime)} / ${convertSecondsToTimeFormat(currentsong.duration)}`;
            document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = ((e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%");
        currentsong.currentTime = (currentsong.duration * e.offsetX / e.target.getBoundingClientRect().width);
    });

    // Adding event listener to Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    });

    // Adding event listener to previous button
    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Adding event listener to next button
    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Loading song list by clicking on cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSong(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

main();
