import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function TeamStats({ team }) {
  return (
      <Card className="border-base-content/20 h-[28rem] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-lg font-poppins">
            Investment Overview
          </CardTitle>
          <p className="text-sm font-inter text-gray-400">
            Why Invest in {team.name} ?
          </p>

          <>
            <p className="font-poppins text-sm font-medium">
              Recent matches stats
            </p>

            {team.sport === "Cricket" ? (
              <table className="table table-sm text-sm font-inter border border-base-content/5">
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Status</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {team.results.map((result, index) => {
                    return (
                      <tr key={index}>
                        <td>{result.round || "N/A"}</td>
                        <td> {result.status || "N/A"}</td>
                        <td> {result.note || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="table table-sm text-sm font-inter border border-base-content/5 ">
                <thead>
                  <tr>
                    <th>Number of Matches</th>
                    <th>Won</th>
                    <th>Win percentage</th>
                    <th>Total win in Last 5 matches</th>
                  </tr>
                </thead>
                <tbody>
                  {team.results.map((result, index) => {
                    return (
                      <tr key={index}>
                        <td> {result.matches?? "N/A"}</td>
                        <td> {result.wins?? "N/A"}</td>
                        <td> {result.win_percentage?? "N/A"}</td>
                        <td> {result.last5_matchesStats?? "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        </CardHeader>
      </Card>
  );
}

export default TeamStats;
