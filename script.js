document.addEventListener("DOMContentLoaded", function () {
    const auto = document.getElementById("auto");
    const bandenDiv = document.getElementById("banden");
    const bpsDiv = document.getElementById("bps");
    const clickValueDisplay = document.getElementById("clickValueDisplay");
    const resetButton = document.getElementById("resetGame");

    const btnGarage = document.getElementById("koopGarage");
    const btnFabriek = document.getElementById("koopFabriek");
    const btnMega = document.getElementById("koopMega");
    const btnMegaPlus = document.getElementById("koopMegaPlus");
    const btnUltra = document.getElementById("koopUltra");
    const btnmiljonair = document.getElementById("koopmiljonair");

    const btnSponsor = document.getElementById("koopSponsor");
    const btnManager = document.getElementById("koopManager");
    const btnMarketeer = document.getElementById("koopMarketeer");

    let banden = 0;
    const baseClickValue = 1;

    const defaultPrices = {
        personeel: 50,
        garage: 1000,
        fabriek: 5000,
        fraudeur: 10000,
        robot: 50000,
        miljonair: 100000,
        sponsor: 500,
        manager: 5000,
        marketeer: 50000
    };

    const upgrades = {
        personeel: { count: 0, price: defaultPrices.personeel, power: 1, button: btnGarage, type: "bps" },
        garage: { count: 0, price: defaultPrices.garage, power: 5, button: btnFabriek, type: "bps" },
        fabriek: { count: 0, price: defaultPrices.fabriek, power: 20, button: btnMega, type: "bps" },
        fraudeur: { count: 0, price: defaultPrices.fraudeur, power: 50, button: btnMegaPlus, type: "bps" },
        robot: { count: 0, price: defaultPrices.robot, power: 100, button: btnUltra, type: "bps" },
        miljonair: { count: 0, price: defaultPrices.miljonair, power: 500, button: btnmiljonair, type: "bps" },
        sponsor: { count: 0, price: defaultPrices.sponsor, power: 1, button: btnSponsor, type: "click" },
        manager: { count: 0, price: defaultPrices.manager, power: 5, button: btnManager, type: "click" },
        marketeer: { count: 0, price: defaultPrices.marketeer, power: 10, button: btnMarketeer, type: "click" }
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

    function updateBandenDisplay() {
        bandenDiv.textContent = `${banden} ${banden === 1 ? "band" : "banden"}`;
    }

    function updateUpgradeButtons() {
        for (const key in upgrades) {
            const up = upgrades[key];
            up.button.disabled = banden < up.price;

            let desc = "";
            if (up.type === "bps") {
                desc = `Koop ${capitalize(key)} (+${up.power} banden/s) (${up.price} banden) - Je hebt ${up.count}`;
            } else if (up.type === "click") {
                desc = `Koop ${capitalize(key)} (+${up.power} per klik) (${up.price} banden) - Je hebt ${up.count}`;
            }
            up.button.textContent = desc;
        }
    }

    function updateBpsDisplay(bps) {
        bpsDiv.textContent = `Totale productie: ${bps} banden/s`;
    }

    function updateClickValueDisplay(clickValue) {
        clickValueDisplay.textContent = `Banden per klik: ${clickValue}`;
    }

    function koopUpgrade(type) {
        const up = upgrades[type];
        if (banden >= up.price) {
            banden -= up.price;
            up.count++;
            up.price = Math.floor(up.price * 1.2);
            updateBandenDisplay();
            updateUpgradeButtons();
            updateBpsDisplay(calculateBps());
            updateClickValueDisplay(calculateClickValue());
            saveGame();
        }
    }

    auto.addEventListener("click", function () {
        auto.classList.add("klik-effect");
        setTimeout(() => {
            auto.classList.remove("klik-effect");
        }, 200);

        const clickValue = calculateClickValue();
        banden += clickValue;
        updateBandenDisplay();
        updateUpgradeButtons();
        updateBpsDisplay(calculateBps());
        updateClickValueDisplay(clickValue);
        saveGame();
    });

    btnGarage.addEventListener("click", () => koopUpgrade("personeel"));
    btnFabriek.addEventListener("click", () => koopUpgrade("garage"));
    btnMega.addEventListener("click", () => koopUpgrade("fabriek"));
    btnMegaPlus.addEventListener("click", () => koopUpgrade("fraudeur"));
    btnUltra.addEventListener("click", () => koopUpgrade("robot"));
    btnmiljonair.addEventListener("click", () => koopUpgrade("miljonair"));
    btnSponsor.addEventListener("click", () => koopUpgrade("sponsor"));
    btnManager.addEventListener("click", () => koopUpgrade("manager"));
    btnMarketeer.addEventListener("click", () => koopUpgrade("marketeer"));

    setInterval(() => {
        const bps = calculateBps();
        if (bps > 0) {
            banden += bps;
            updateBandenDisplay();
            updateUpgradeButtons();
            updateBpsDisplay(bps);
            updateClickValueDisplay(calculateClickValue());
            saveGame();
        }
    }, 1000);

    // Save and load game

    function saveGame() {
        const saveData = {
            banden,
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
                banden = data.banden || 0;
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

    // Reset button
    resetButton.addEventListener("click", () => {
        if (confirm("Weet je zeker dat je het spel wilt resetten? Alles gaat verloren.")) {
            localStorage.removeItem("autosave");
            banden = 0;
            for (const key in upgrades) {
                upgrades[key].count = 0;
                upgrades[key].price = defaultPrices[key];
            }
            updateBandenDisplay();
            updateUpgradeButtons();
            updateBpsDisplay(calculateBps());
            updateClickValueDisplay(calculateClickValue());
            location.reload();
        }
    });

    // Keypress 'f' with password prompt
    document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "f") {
            const password = prompt("Voer het wachtwoord in:");
            if (password === "Chick is de beste!") {
                banden += 100000;
                updateBandenDisplay();
                updateUpgradeButtons();
                updateBpsDisplay(calculateBps());
                updateClickValueDisplay(calculateClickValue());
                saveGame();
                alert("Succes! Je hebt 100000 banden gekregen.");
            } else {
                alert("Fout wachtwoord!");
            }
        }
    });

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Init game state
    loadGame();
    updateBandenDisplay();
    updateUpgradeButtons();
    updateBpsDisplay(calculateBps());
    updateClickValueDisplay(calculateClickValue());
});
