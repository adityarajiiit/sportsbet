import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function PlayerStats({ player }) {
  return (
      <Card className="border-base-content/20 h-[28rem] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-lg font-poppins">
            Investment Overview
          </CardTitle>
          <p className="text-sm font-inter text-gray-400">
            Why Invest in {player.name} ?
          </p>

          {player.sport === "Cricket" ? (
            <div className="">
              <p className="font-poppins text-sm font-medium">
                Recent matches stats
              </p>
              {player.career?.[0]?.batting ? (
                <table className="table table-sm text-sm font-inter border border-base-content/5 mt-2">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Number of Matches </td>
                      <td> {player.career?.[0]?.batting?.matches ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Number of Innings </td>
                      <td>{player.career?.[0]?.batting?.innings ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Total Runs Scored </td>
                      <td>
                        {player.career?.[0]?.batting?.runs_scored ?? "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>Highest Runs Scored </td>
                      <td>
                        {" "}
                        {player.career?.[0]?.batting?.highest_inning_score ??
                          "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>Strike Rate </td>
                      <td>
                        {player.career?.[0]?.batting?.strike_rate ?? "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td> Average</td>
                      <td>{player.career?.[0]?.batting?.average ?? "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : null}
              {player.career?.[0]?.bowling ? (
                <table className="table table-sm text-sm font-inter pl-4 border border-base-content/5 mt-2">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Number of Matches: </td>
                      <td>{player.career?.[0]?.bowling?.matches ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Number of Innings: </td>
                      <td> {player.career?.[0]?.bowling?.innings ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Number of Wickets: </td>
                      <td> {player.career?.[0]?.bowling?.wickets ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Economy: </td>
                      <td>
                        {" "}
                        {player.career?.[0]?.bowling?.econ_rate ?? "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>Number of Overs: </td>
                      <td> {player.career?.[0]?.bowling?.overs ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Medians:</td>
                      <td>{player.career?.[0]?.bowling?.medians ?? "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
      </Card>
  );
}

export default PlayerStats;
