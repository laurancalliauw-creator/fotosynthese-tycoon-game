document.addEventListener("DOMContentLoaded", function () {

    const auto = document.getElementById("auto");
    const energieDiv = document.getElementById("banden");
    const bpsDiv = document.getElementById("bps");
    const clickValueDisplay = document.getElementById("clickValueDisplay");
    const resetButton = document.getElementById("resetGame");

    const btnZonlicht = document.getElementById("Zonlicht");
    const btnCO2 = document.getElementById("koopFabriek");
    const btnWater = document.getElementById("koopMega");
    const btnBladgroen = document.getElementById("koopMegaPlus");
    const btnBoom = document.getElementById("koopUltra");
    const btnRegenwoud = document.getElementById("koopmiljonair");

    const btnMeststof = document.getElementById("koopSponsor");
    const btnBijen = document.getElementById("koopManager");
    const btnGenetica = document.getElementById("koopMarketeer");

    let energie = 0;
    const baseClickValue = 1;

    const defaultPrices = {
        zonlicht: 50,
        co2: 200,
        water: 1000,
        bladgroen: 5000,
        groteBoom: 20000,
        regenwoud: 100000,
        meststof: 500,
        bijen: 5000,
        genetica: 50000
    };

    const upgrades = {
        zonlicht: { count: 0, price: defaultPrices.zonlicht, power: 1, button: btnZonlicht, type: "bps" },
        co2: { count: 0, price: defaultPrices.co2, power: 5, button: btnCO2, type: "bps" },
        water: { count: 0, price: defaultPrices.water, power: 20, button: btnWater, type: "bps" },
        bladgroen: { count: 0, price: defaultPrices.bladgroen, power: 50, button: btnBladgroen, type: "bps" },
        groteBoom: { count: 0, price: defaultPrices.groteBoom, power: 100, button: btnBoom, type: "bps" },
        regenwoud: { count: 0, price: defaultPrices.regenwoud, power: 500, button: btnRegenwoud, type: "bps" },
        meststof: { count: 0, price: defaultPrices.meststof, power: 1, button: btnMeststof, type: "click" },
        bijen: { count: 0, price: defaultPrices.bijen, power: 5, button: btnBijen, type: "click" },
        genetica: { count: 0, price: defaultPrices.genetica, power: 10, button: btnGenetica, type: "click" }
    };

    function calculateBps() {
        let total = 0;
        for (const key in upgrades) {
            if (upgrades[key].type === "bps") {
                total += upgrades[key].count * upgrades[key].power;
            }
        }
        return total;
    }

    function calculateClickValue() {
        let extraClicks = 0;
        for (const key in upgrades) {
            if (upgrades[key].type === "click") {
                extraClicks += upgrades[key].count * upgrades[key].power;
            }
        }
        return baseClickValue + extraClicks;
    }

    function updateEnergieDisplay() {
        energieDiv.textContent = `${energie} energie`;
    }

    function updateUpgradeButtons() {
        for (const key in upgrades) {
            const up = upgrades[key];
            const genoeg = energie >= up.price;

            up.button.disabled = !genoeg;

            if (genoeg) {
                up.button.style.opacity = "1";
                up.button.style.cursor = "pointer";
                up.button.style.filter = "none";
            } else {
                up.button.style.opacity = "0.5";
                up.button.style.cursor = "not-allowed";
                up.button.style.filter = "grayscale(100%)";
            }

            let desc = "";
            if (up.type === "bps") {
                desc = `Koop ${capitalize(key)} (+${up.power} energie/s) (${up.price} energie) - Je hebt ${up.count}`;
            } else {
                desc = `Koop ${capitalize(key)} (+${up.power} per klik) (${up.price} energie) - Je hebt ${up.count}`;
            }

            up.button.textContent = desc;
        }
    }

    function updateBpsDisplay(bps) {
        bpsDiv.textContent = `Totale fotosynthese: ${bps} energie/s`;
    }

    function updateClickValueDisplay(clickValue) {
        clickValueDisplay.textContent = `energie per klik: ${clickValue}`;
    }

    function koopUpgrade(type) {
        const up = upgrades[type];
        if (energie >= up.price) {
            energie -= up.price;
            up.count++;
            up.price = Math.floor(up.price * 1.2);

            updateEnergieDisplay();
            updateUpgradeButtons();
            updateBpsDisplay(calculateBps());
            updateClickValueDisplay(calculateClickValue());
            saveGame();
        }
    }

    auto.addEventListener("click", function () {
        const clickValue = calculateClickValue();
        energie += clickValue;

        updateEnergieDisplay();
        updateUpgradeButtons();
        updateBpsDisplay(calculateBps());
        updateClickValueDisplay(clickValue);
        saveGame();
    });

    btnZonlicht.addEventListener("click", () => koopUpgrade("zonlicht"));
    btnCO2.addEventListener("click", () => koopUpgrade("co2"));
    btnWater.addEventListener("click", () => koopUpgrade("water"));
    btnBladgroen.addEventListener("click", () => koopUpgrade("bladgroen"));
    btnBoom.addEventListener("click", () => koopUpgrade("groteBoom"));
    btnRegenwoud.addEventListener("click", () => koopUpgrade("regenwoud"));
    btnMeststof.addEventListener("click", () => koopUpgrade("meststof"));
    btnBijen.addEventListener("click", () => koopUpgrade("bijen"));
    btnGenetica.addEventListener("click", () => koopUpgrade("genetica"));

    setInterval(() => {
        const bps = calculateBps();
        if (bps > 0) {
            energie += bps;
            updateEnergieDisplay();
            updateUpgradeButtons();
            updateBpsDisplay(bps);
            updateClickValueDisplay(calculateClickValue());
            saveGame();
        }
    }, 1000);

    function saveGame() {
        const saveData = {
            energie,
            upgrades: {}
        };
        for (const key in upgrades) {
            saveData.upgrades[key] = {
                count: upgrades[key].count,
                price: upgrades[key].price
            };
        }
        localStorage.setItem("autosave", JSON.stringify(saveData));
    }

    function loadGame() {
        const saveData = localStorage.getItem("autosave");
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                energie = data.energie || 0;
                for (const key in upgrades) {
                    if (data.upgrades[key]) {
                        upgrades[key].count = data.upgrades[key].count || 0;
                        upgrades[key].price = data.upgrades[key].price || defaultPrices[key];
                    }
                }
            } catch {
                console.warn("Ongeldige save data");
            }
        }
    }

    resetButton.addEventListener("click", () => {
        if (confirm("Weet je zeker dat je het spel wilt resetten? Alles gaat verloren.")) {
            localStorage.removeItem("autosave");
            energie = 0;
            for (const key in upgrades) {
                upgrades[key].count = 0;
                upgrades[key].price = defaultPrices[key];
            }
            location.reload();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "f") {
            const password = prompt("Voer het wachtwoord in:");
            if (password === "Chick is de beste!") {
                energie += 100000;
                updateEnergieDisplay();
                updateUpgradeButtons();
                updateBpsDisplay(calculateBps());
                updateClickValueDisplay(calculateClickValue());
                saveGame();
                alert("Succes! Je hebt 100000 energie gekregen.");
            } else {
                alert("Fout wachtwoord!");
            }
        }
    });

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    loadGame();
    updateEnergieDisplay();
    updateUpgradeButtons();
    updateBpsDisplay(calculateBps());
    updateClickValueDisplay(calculateClickValue());
});
