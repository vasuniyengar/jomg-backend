import User from "./User.js";
import Role from "./Role.js";
import UserRole from "./UserRole.js";
import Club from "./Club.js";
import Tournament from "./Tournament.js";
import Bracket from "./Bracket.js";
import Group from "./Group.js";
import Format from "./Format.js";
import Team from "./Team.js";
import TeamPlayer from "./TeamPlayer.js";
import BracketFormat from "./BracketFormat.js";
import ScoringList from "./ScoringList.js";
import Event from "./Event.js";
import PlayoffSeeding from "./PlayoffSeeding.js";
import PlayerRegistration from "./PlayerRegistration.js";
import Pool from "./Pools.js";
import PoolTeam from "./PoolTeam.js";
import Match from "./Match.js";
import Round from "./Round.js";
import PoolTeamStats from "./PoolTeamStats.js";

//user has many roles ,each role belongs to many user so when user source model userId and when role source model roleId
User.belongsToMany(Role, { through: UserRole, foreignKey: "userId" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "roleId" });

//user club association club depends on user so hostid
User.hasMany(Club, { foreignKey: "hostId" });
Club.belongsTo(User, { foreignKey: "hostId" });

//club tournaments association tournament depends on club so clubId
Club.hasMany(Tournament, { foreignKey: "clubId" });
Tournament.belongsTo(Club, { foreignKey: "clubId" });

//user host tournaments`
User.hasMany(Tournament, { foreignKey: "hostId" });
Tournament.belongsTo(User, { foreignKey: "hostId" });

//tournament brackets association bracket depends on tournament so tournamentId
Tournament.hasMany(Bracket, { foreignKey: "tournamentId" });
Bracket.belongsTo(Tournament, { foreignKey: "tournamentId" });

//bracketFormat associations
Bracket.belongsTo(BracketFormat, { foreignKey: "bracketFormatId" });
BracketFormat.hasMany(Bracket, { foreignKey: "bracketFormatId" });

//ScoringList associations
Bracket.belongsTo(ScoringList, { foreignKey: "scoringListId" });
ScoringList.hasMany(Bracket, { foreignKey: "scoringListId" });

//playoffSeedingId associations
Bracket.belongsTo(PlayoffSeeding, { foreignKey: "playoffSeedingId" });
PlayoffSeeding.hasMany(Bracket, { foreignKey: "playoffSeedingId" });

//brackets has many teams and team belongs to bracket
Bracket.hasMany(Team, { foreignKey: "bracketId" });
Team.belongsTo(Bracket, { foreignKey: "bracketId" });

//Tournament has many teams and team belongs to Tournament
Tournament.hasMany(Team, { foreignKey: "tournamentId" });
Team.belongsTo(Tournament, { foreignKey: "tournamentId" });

// //team has many players and players belongsto many teams
// Team.belongsToMany(User, { through: "TeamPlayer", foreignKey: "teamId" });
// User.belongsToMany(Team, { through: "TeamPlayer", foreignKey: "playerId" });

Event.hasMany(Bracket, { foreignKey: "eventId" });
Bracket.belongsTo(Event, { foreignKey: "eventId" });

User.hasMany(PlayerRegistration, { foreignKey: "playerId" });
PlayerRegistration.belongsTo(User, { foreignKey: "playerId" });

User.hasMany(PlayerRegistration, {
  foreignKey: "partnerId",
  as: "PartnerRegistrations",
});
PlayerRegistration.belongsTo(User, {
  foreignKey: "partnerId",
  as: "Partner",
});

Tournament.hasMany(PlayerRegistration, { foreignKey: "tournamentId" });
PlayerRegistration.belongsTo(Tournament, { foreignKey: "tournamentId" });

Bracket.hasMany(PlayerRegistration, { foreignKey: "bracketId" });
PlayerRegistration.belongsTo(Bracket, { foreignKey: "bracketId" });

//  Team  TeamPlayer association
Team.hasMany(TeamPlayer, { foreignKey: "teamId", as: "TeamPlayers" });
TeamPlayer.belongsTo(Team, { foreignKey: "teamId", as: "Team" });

//  TeamPlayer User association
User.hasMany(TeamPlayer, { foreignKey: "playerId", as: "PlayerTeams" });
TeamPlayer.belongsTo(User, { foreignKey: "playerId", as: "User" });

//Pool tournaments and brackets
Pool.belongsTo(Tournament, { foreignKey: "tournamentId" });
Tournament.hasMany(Pool, { foreignKey: "tournamentId" });

Pool.belongsTo(Bracket, { foreignKey: "bracketId" });
Bracket.hasMany(Pool, { foreignKey: "bracketId" });

//PoolTeam for pool and team
PoolTeam.belongsTo(Pool, { foreignKey: "poolId" });
Pool.hasMany(PoolTeam, { foreignKey: "poolId" });

PoolTeam.belongsTo(Team, { foreignKey: "teamId" });
Team.hasMany(PoolTeam, { foreignKey: "teamId" });

// match pool association
Match.belongsTo(Pool, { foreignKey: "poolId" });
Pool.hasMany(Match, { foreignKey: "poolId" });

//match teams association
Match.belongsTo(Team, { as: "Team1", foreignKey: "team1Id" });
Match.belongsTo(Team, { as: "Team2", foreignKey: "team2Id" });

//team match association
Team.hasMany(Match, { as: "MatchesAsTeam1", foreignKey: "team1Id" });
Team.hasMany(Match, { as: "MatchesAsTeam2", foreignKey: "team2Id" });

// Round model
Round.belongsTo(Bracket, { foreignKey: "bracketId", as: "Bracket" });
Bracket.hasMany(Round, { foreignKey: "bracketId", as: "Rounds" });

// Round  Pool associations
Round.belongsTo(Pool, { foreignKey: "poolId" });
Pool.hasMany(Round, { foreignKey: "poolId" });

//Round Match associations
Round.hasMany(Match, { foreignKey: "roundId" });
Match.belongsTo(Round, { foreignKey: "roundId" });

PoolTeamStats.belongsTo(Team, { foreignKey: "teamId" });
PoolTeamStats.belongsTo(Pool, { foreignKey: "poolId" });

Team.hasOne(PoolTeamStats, { foreignKey: "teamId" });
Pool.hasMany(PoolTeamStats, { foreignKey: "poolId" });

PoolTeam.hasOne(PoolTeamStats, {
  foreignKey: "teamId",
  sourceKey: "teamId",
  as: "stats",
});
PoolTeamStats.belongsTo(PoolTeam, {
  foreignKey: "teamId",
  targetKey: "teamId",
  as: "team",
});

export default {
  User,
  Role,
  UserRole,
  Club,
  Tournament,
  Bracket,
  Group,
  Format,
  Team,
  TeamPlayer,
  BracketFormat,
  ScoringList,
  Event,
  PlayoffSeeding,
  PlayerRegistration,
  Pool,
  PoolTeam,
  Match,
  Round,
  PoolTeamStats,
};
