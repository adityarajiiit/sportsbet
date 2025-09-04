const capitalizeFirst = (word) =>
  word.charAt(0).toUpperCase() + word.slice(1);

const rawPositions = [
  { football: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger"] },
  { cricket: ["Batter", "Bowler", "All-rounder", "Wicketkeeper"] },
  {
    rugby: [
      "Prop",
      "Hooker",
      "Lock",
      "Flanker",
      "Number Eight",
      "Scrum-half",
      "Fly-half",
      "Centre",
      "Wing",
      "Fullback",
    ],
  },
  { mma: ["Striker", "Grappler", "All-rounder"] },
  {
    boxing: [
      "Orthodox Fighter",
      "Southpaw Fighter",
      "Slugger",
      "Out-boxer",
      "Counterpuncher",
    ],
  },
  {
    tennis: [
      "Baseline Player",
      "Serve-and-Volley Player",
      "All-court Player",
      "Counterpuncher",
    ],
  },
  { f1: ["Driver", "Race Engineer", "Pit Crew", "Team Principal"] },
  {
    basketball: [
      "Point Guard",
      "Shooting Guard",
      "Small Forward",
      "Power Forward",
      "Center",
    ],
  },
  {
    badminton: [
      "Singles Player",
      "Doubles Player (Front-court)",
      "Doubles Player (Back-court)",
      "Mixed Doubles",
    ],
  },
  {
    wrestling: [
      "Freestyle Wrestler",
      "Greco-Roman Wrestler",
      "Submission Wrestler",
    ],
  },
  {
    volleyball: [
      "Setter",
      "Outside Hitter",
      "Opposite Hitter",
      "Middle Blocker",
      "Libero",
    ],
  },
];

export const positions = rawPositions.map((obj) => {
  const key = Object.keys(obj)[0];
  const value = obj[key];
  return { [capitalizeFirst(key)]: value };
});

