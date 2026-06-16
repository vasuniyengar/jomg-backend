--
-- PostgreSQL database dump
--

\restrict koo2300srtsY2xzQwyngqDHgkJJzDisYnsdFc8QKg3Fw41Fei2p1mkEj9Jrbdw1

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Matches" (
    id integer NOT NULL,
    "team1Id" integer NOT NULL,
    "team2Id" integer NOT NULL,
    "poolId" integer,
    "roundId" integer NOT NULL,
    status text DEFAULT 'not_started'::text NOT NULL,
    "scoreTeam1" integer DEFAULT 0,
    "scoreTeam2" integer DEFAULT 0,
    type text DEFAULT 'pool'::text,
    "winnerTeamId" integer,
    "loserTeamId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Matches" OWNER TO postgres;

--
-- Name: Matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Matches_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Matches_id_seq" OWNER TO postgres;

--
-- Name: Matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Matches_id_seq" OWNED BY public."Matches".id;


--
-- Name: Pool; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pool" (
    id integer NOT NULL,
    "poolName" text NOT NULL,
    "bracketId" integer NOT NULL,
    "tournamentId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Pool" OWNER TO postgres;

--
-- Name: PoolTeam; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PoolTeam" (
    "poolId" integer NOT NULL,
    "teamId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PoolTeam" OWNER TO postgres;

--
-- Name: Pool_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Pool_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Pool_id_seq" OWNER TO postgres;

--
-- Name: Pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Pool_id_seq" OWNED BY public."Pool".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: bracketformats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bracketformats (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bracketformats OWNER TO postgres;

--
-- Name: bracketformats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bracketformats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bracketformats_id_seq OWNER TO postgres;

--
-- Name: bracketformats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bracketformats_id_seq OWNED BY public.bracketformats.id;


--
-- Name: brackets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brackets (
    id integer NOT NULL,
    name text NOT NULL,
    "maxTeams" integer NOT NULL,
    "minAge" integer DEFAULT 0,
    "maxAge" integer DEFAULT 0,
    "minRating" numeric(4,2) DEFAULT 0 NOT NULL,
    "maxRating" numeric(4,2) DEFAULT 0 NOT NULL,
    "bracketFormatId" integer NOT NULL,
    "scoringListId" integer NOT NULL,
    "playoffSeedingId" integer NOT NULL,
    "playoffMatchId" integer,
    "semiFinalMatchId" integer,
    "bronzeMatchId" integer,
    "goldMatchId" integer,
    "roundId" integer,
    "tournamentId" integer NOT NULL,
    "eventId" integer NOT NULL,
    "poolStarted" boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "registrationFee" numeric(10,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "scoringConfig" jsonb,
    division text
);


ALTER TABLE public.brackets OWNER TO postgres;

--
-- Name: brackets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brackets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brackets_id_seq OWNER TO postgres;

--
-- Name: brackets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brackets_id_seq OWNED BY public.brackets.id;


--
-- Name: clubs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clubs (
    id integer NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    "phoneNumber" text NOT NULL,
    "clubType" text NOT NULL,
    description text,
    "hostId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clubs OWNER TO postgres;

--
-- Name: clubs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clubs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clubs_id_seq OWNER TO postgres;

--
-- Name: clubs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clubs_id_seq OWNED BY public.clubs.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    "eventName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: formats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formats (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.formats OWNER TO postgres;

--
-- Name: formats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formats_id_seq OWNER TO postgres;

--
-- Name: formats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formats_id_seq OWNED BY public.formats.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: playerbrackets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playerbrackets (
    id integer NOT NULL,
    "playerId" integer NOT NULL,
    "tournamentId" integer NOT NULL,
    "bracketId" integer NOT NULL,
    status text DEFAULT 'registered'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.playerbrackets OWNER TO postgres;

--
-- Name: playerbrackets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playerbrackets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playerbrackets_id_seq OWNER TO postgres;

--
-- Name: playerbrackets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playerbrackets_id_seq OWNED BY public.playerbrackets.id;


--
-- Name: playerregistrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playerregistrations (
    id integer NOT NULL,
    "playerId" integer NOT NULL,
    "tournamentId" integer NOT NULL,
    "bracketId" integer NOT NULL,
    status text DEFAULT 'registered'::text NOT NULL,
    "paymentStatus" text DEFAULT 'paid'::text NOT NULL,
    "checkInStatus" text DEFAULT 'not_checked_in'::text NOT NULL,
    "checkInTime" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paymentEmailSentCount" integer DEFAULT 0 NOT NULL,
    "clubName" text,
    "playerRole" text,
    "rosterNumber" text,
    division text,
    "partnerId" integer
);


ALTER TABLE public.playerregistrations OWNER TO postgres;

--
-- Name: playerregistrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playerregistrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playerregistrations_id_seq OWNER TO postgres;

--
-- Name: playerregistrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playerregistrations_id_seq OWNED BY public.playerregistrations.id;


--
-- Name: playoffseedings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playoffseedings (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.playoffseedings OWNER TO postgres;

--
-- Name: playoffseedings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playoffseedings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playoffseedings_id_seq OWNER TO postgres;

--
-- Name: playoffseedings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playoffseedings_id_seq OWNED BY public.playoffseedings.id;


--
-- Name: poolteamstats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poolteamstats (
    id integer NOT NULL,
    "poolId" integer NOT NULL,
    "teamId" integer NOT NULL,
    wins integer DEFAULT 0,
    losses integer DEFAULT 0,
    "pointsFor" integer DEFAULT 0,
    "pointsAgainst" integer DEFAULT 0,
    "pointDifference" integer DEFAULT 0,
    "pdPercent" double precision DEFAULT 0,
    "playoffSeed" integer,
    "playoffWins" integer DEFAULT 0,
    "playoffPointsFor" integer DEFAULT 0,
    "playoffPointsAgainst" integer DEFAULT 0,
    "playoffPointDifference" integer DEFAULT 0,
    "finalRank" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.poolteamstats OWNER TO postgres;

--
-- Name: poolteamstats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.poolteamstats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.poolteamstats_id_seq OWNER TO postgres;

--
-- Name: poolteamstats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.poolteamstats_id_seq OWNED BY public.poolteamstats.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: rounds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rounds (
    id integer NOT NULL,
    "poolId" integer,
    "roundNumber" integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "bracketId" integer,
    type text DEFAULT 'pool'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rounds OWNER TO postgres;

--
-- Name: rounds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rounds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rounds_id_seq OWNER TO postgres;

--
-- Name: rounds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rounds_id_seq OWNED BY public.rounds.id;


--
-- Name: scoringlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scoringlists (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    rules jsonb
);


ALTER TABLE public.scoringlists OWNER TO postgres;

--
-- Name: scoringlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scoringlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scoringlists_id_seq OWNER TO postgres;

--
-- Name: scoringlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scoringlists_id_seq OWNED BY public.scoringlists.id;


--
-- Name: teamplayers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teamplayers (
    id integer NOT NULL,
    "playerId" integer NOT NULL,
    "teamId" integer NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teamplayers OWNER TO postgres;

--
-- Name: teamplayers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teamplayers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teamplayers_id_seq OWNER TO postgres;

--
-- Name: teamplayers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teamplayers_id_seq OWNED BY public.teamplayers.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    "teamName" text,
    "bracketId" integer NOT NULL,
    "tournamentId" integer NOT NULL,
    status text DEFAULT 'registered'::text NOT NULL,
    "paymentStatus" text DEFAULT 'paid'::text,
    "isComplete" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: tournaments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tournaments (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "entryFee" numeric(10,2) DEFAULT 0 NOT NULL,
    discount integer DEFAULT 0 NOT NULL,
    "tournamentTumbnail" text,
    location text NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "registrationOpenDate" date NOT NULL,
    "registrationCloseDate" date NOT NULL,
    status text NOT NULL,
    "organizerInfo" text NOT NULL,
    slug text NOT NULL,
    "clubId" integer NOT NULL,
    "hostId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    venue text,
    timezone text,
    "refundDeadline" date,
    "refundFee" numeric(10,2) DEFAULT 0 NOT NULL,
    "duprRecorded" boolean DEFAULT true NOT NULL,
    "duprEnforced" boolean DEFAULT false NOT NULL,
    "requireSkillRating" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.tournaments OWNER TO postgres;

--
-- Name: tournaments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tournaments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tournaments_id_seq OWNER TO postgres;

--
-- Name: tournaments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tournaments_id_seq OWNED BY public.tournaments.id;


--
-- Name: userroles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.userroles (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.userroles OWNER TO postgres;

--
-- Name: userroles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.userroles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.userroles_id_seq OWNER TO postgres;

--
-- Name: userroles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.userroles_id_seq OWNED BY public.userroles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    firstname text NOT NULL,
    lastname text NOT NULL,
    email text NOT NULL,
    password text,
    provider text DEFAULT 'local'::text NOT NULL,
    "providerId" text,
    "profilePicture" text,
    age integer NOT NULL,
    gender text NOT NULL,
    "phoneNumber" text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verificationToken" text,
    "passwordResetToken" text,
    "passwordResetExpires" timestamp(3) without time zone,
    "accountExpiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "duprId" text,
    facebook text,
    instagram text,
    "paymentMethod" text,
    "paymentStatus" text,
    "roleId" integer,
    "duprRating" numeric(4,2)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: Matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Matches" ALTER COLUMN id SET DEFAULT nextval('public."Matches_id_seq"'::regclass);


--
-- Name: Pool id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pool" ALTER COLUMN id SET DEFAULT nextval('public."Pool_id_seq"'::regclass);


--
-- Name: bracketformats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bracketformats ALTER COLUMN id SET DEFAULT nextval('public.bracketformats_id_seq'::regclass);


--
-- Name: brackets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brackets ALTER COLUMN id SET DEFAULT nextval('public.brackets_id_seq'::regclass);


--
-- Name: clubs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs ALTER COLUMN id SET DEFAULT nextval('public.clubs_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: formats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formats ALTER COLUMN id SET DEFAULT nextval('public.formats_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: playerbrackets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerbrackets ALTER COLUMN id SET DEFAULT nextval('public.playerbrackets_id_seq'::regclass);


--
-- Name: playerregistrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerregistrations ALTER COLUMN id SET DEFAULT nextval('public.playerregistrations_id_seq'::regclass);


--
-- Name: playoffseedings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playoffseedings ALTER COLUMN id SET DEFAULT nextval('public.playoffseedings_id_seq'::regclass);


--
-- Name: poolteamstats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poolteamstats ALTER COLUMN id SET DEFAULT nextval('public.poolteamstats_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: rounds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds ALTER COLUMN id SET DEFAULT nextval('public.rounds_id_seq'::regclass);


--
-- Name: scoringlists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scoringlists ALTER COLUMN id SET DEFAULT nextval('public.scoringlists_id_seq'::regclass);


--
-- Name: teamplayers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teamplayers ALTER COLUMN id SET DEFAULT nextval('public.teamplayers_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: tournaments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournaments ALTER COLUMN id SET DEFAULT nextval('public.tournaments_id_seq'::regclass);


--
-- Name: userroles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userroles ALTER COLUMN id SET DEFAULT nextval('public.userroles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: Matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Matches" (id, "team1Id", "team2Id", "poolId", "roundId", status, "scoreTeam1", "scoreTeam2", type, "winnerTeamId", "loserTeamId", "createdAt", "updatedAt") FROM stdin;
260	26	16	37	131	completed	11	7	pool	26	16	2026-06-11 19:02:05.753	2026-06-11 19:02:05.753
261	22	13	37	131	completed	9	11	pool	13	22	2026-06-11 19:02:05.753	2026-06-11 19:02:05.753
262	26	13	37	132	completed	11	5	pool	26	13	2026-06-11 19:02:05.761	2026-06-11 19:02:05.761
263	16	22	37	132	completed	8	11	pool	22	16	2026-06-11 19:02:05.761	2026-06-11 19:02:05.761
264	26	22	37	133	completed	11	9	pool	26	22	2026-06-11 19:02:05.768	2026-06-11 19:02:05.768
265	13	16	37	133	completed	11	6	pool	13	16	2026-06-11 19:02:05.768	2026-06-11 19:02:05.768
266	23	28	38	134	completed	11	8	pool	23	28	2026-06-11 19:02:05.784	2026-06-11 19:02:05.784
267	24	18	38	134	completed	7	11	pool	18	24	2026-06-11 19:02:05.784	2026-06-11 19:02:05.784
268	23	18	38	135	completed	11	4	pool	23	18	2026-06-11 19:02:05.787	2026-06-11 19:02:05.787
269	28	24	38	135	completed	9	11	pool	24	28	2026-06-11 19:02:05.787	2026-06-11 19:02:05.787
270	23	24	38	136	completed	11	10	pool	23	24	2026-06-11 19:02:05.793	2026-06-11 19:02:05.793
271	18	28	38	136	completed	11	7	pool	18	28	2026-06-11 19:02:05.793	2026-06-11 19:02:05.793
272	14	20	39	137	completed	6	11	pool	20	14	2026-06-11 19:02:05.802	2026-06-11 19:02:05.802
273	25	21	39	137	completed	11	8	pool	25	21	2026-06-11 19:02:05.802	2026-06-11 19:02:05.802
274	14	21	39	138	completed	11	9	pool	14	21	2026-06-11 19:02:05.805	2026-06-11 19:02:05.805
275	20	25	39	138	completed	11	7	pool	20	25	2026-06-11 19:02:05.805	2026-06-11 19:02:05.805
276	14	25	39	139	completed	8	11	pool	25	14	2026-06-11 19:02:05.809	2026-06-11 19:02:05.809
277	21	20	39	139	completed	11	6	pool	21	20	2026-06-11 19:02:05.809	2026-06-11 19:02:05.809
278	19	27	40	140	completed	11	9	pool	19	27	2026-06-11 19:02:05.819	2026-06-11 19:02:05.819
279	17	15	40	140	completed	11	8	pool	17	15	2026-06-11 19:02:05.819	2026-06-11 19:02:05.819
280	19	15	40	141	completed	11	6	pool	19	15	2026-06-11 19:02:05.822	2026-06-11 19:02:05.822
281	27	17	40	141	completed	7	11	pool	17	27	2026-06-11 19:02:05.822	2026-06-11 19:02:05.822
282	19	17	40	142	completed	11	5	pool	19	17	2026-06-11 19:02:05.826	2026-06-11 19:02:05.826
283	15	27	40	142	completed	11	9	pool	15	27	2026-06-11 19:02:05.826	2026-06-11 19:02:05.826
316	26	16	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.556	2026-06-12 15:59:47.556
317	23	27	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.558	2026-06-12 15:59:47.558
318	19	28	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.56	2026-06-12 15:59:47.56
319	25	21	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.562	2026-06-12 15:59:47.562
320	17	14	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.564	2026-06-12 15:59:47.564
321	18	24	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.566	2026-06-12 15:59:47.566
322	20	15	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.568	2026-06-12 15:59:47.568
323	13	22	\N	159	not_started	0	0	playoff	\N	\N	2026-06-12 15:59:47.57	2026-06-12 15:59:47.57
\.


--
-- Data for Name: Pool; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pool" (id, "poolName", "bracketId", "tournamentId", "createdAt", "updatedAt") FROM stdin;
37	Pool A	1	1	2026-06-11 19:02:05.728	2026-06-11 19:02:05.728
38	Pool B	1	1	2026-06-11 19:02:05.772	2026-06-11 19:02:05.772
39	Pool C	1	1	2026-06-11 19:02:05.794	2026-06-11 19:02:05.794
40	Pool D	1	1	2026-06-11 19:02:05.811	2026-06-11 19:02:05.811
\.


--
-- Data for Name: PoolTeam; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PoolTeam" ("poolId", "teamId", "createdAt", "updatedAt") FROM stdin;
37	26	2026-06-11 19:02:05.735	2026-06-11 19:02:05.735
37	22	2026-06-11 19:02:05.738	2026-06-11 19:02:05.738
37	13	2026-06-11 19:02:05.742	2026-06-11 19:02:05.742
37	16	2026-06-11 19:02:05.744	2026-06-11 19:02:05.744
38	23	2026-06-11 19:02:05.775	2026-06-11 19:02:05.775
38	24	2026-06-11 19:02:05.777	2026-06-11 19:02:05.777
38	18	2026-06-11 19:02:05.778	2026-06-11 19:02:05.778
38	28	2026-06-11 19:02:05.78	2026-06-11 19:02:05.78
39	14	2026-06-11 19:02:05.796	2026-06-11 19:02:05.796
39	25	2026-06-11 19:02:05.797	2026-06-11 19:02:05.797
39	21	2026-06-11 19:02:05.799	2026-06-11 19:02:05.799
39	20	2026-06-11 19:02:05.8	2026-06-11 19:02:05.8
40	19	2026-06-11 19:02:05.812	2026-06-11 19:02:05.812
40	17	2026-06-11 19:02:05.813	2026-06-11 19:02:05.813
40	15	2026-06-11 19:02:05.815	2026-06-11 19:02:05.815
40	27	2026-06-11 19:02:05.816	2026-06-11 19:02:05.816
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3baf8db3-5bf9-4833-badc-af311828407d	13940eb0d23816e3698646463311d2f4796e6411635f606389501b13e82eeb94	2026-05-26 23:35:12.4587+00	20260506170000_init	\N	\N	2026-05-26 23:35:12.443829+00	1
d81a1264-c2e6-4ce0-a8d3-7cb166051cd6	62c6b84ac32436234b8719176146e61cec42bafa2c5bb20d23b9cee809b5ff5d	2026-05-26 23:35:12.460715+00	20260506184000_add_user_token_version	\N	\N	2026-05-26 23:35:12.459268+00	1
05cc7429-22d5-4b08-a5d8-854158b4c7ad	9004b0002bc4b006fd69daf152f669567bdb06240f8832de72a030c7967cc8fc	2026-05-26 23:35:12.462148+00	20260506223000_add_auth_roles	\N	\N	2026-05-26 23:35:12.461098+00	1
bdc04d86-5bca-4194-9aa5-b6eb5dae3e17	a4fdd3b38162e70dd44cb94f09bf84c7eb753f35a489dbeca7caea91434c8678	2026-05-26 23:35:12.463883+00	20260516120000_tournament_wizard_fields	\N	\N	2026-05-26 23:35:12.462491+00	1
d98061a2-2e93-49bf-9052-d084cdc68cd2	c41b9ea1b5d883e14e96d32dcdf8cd40e0c1e8c834fcb493b6557d3bd86c5c83	2026-05-26 23:35:12.465218+00	20260524120000_payment_email_sent_count	\N	\N	2026-05-26 23:35:12.46423+00	1
3951a5fa-65fe-4204-a60a-68a7ea608fc2	0a831b3053304db15d591919162e32e497f8b10e9df0396519c0a4edf88f1b36	2026-05-26 23:35:12.46665+00	20260525120000_scoring_config	\N	\N	2026-05-26 23:35:12.465548+00	1
02852da3-05e8-49c3-a825-1caf070ed4ca	813f912055f00abe86311171b840640763871479b5cbbca160f78b8c3fb12bb0	2026-05-27 21:13:06.707097+00	20260527211306_add_new_columns	\N	\N	2026-05-27 21:13:06.705265+00	1
e2f3709e-ea6f-4aeb-85c9-8aad971736f8	bdd254f0578fb2ddec965762a5bbfc259746205ca8abc3ea9e760cdc5a2b2e5c	2026-05-29 19:12:44.654275+00	20260529191244_additional_player_regcolumns	\N	\N	2026-05-29 19:12:44.647205+00	1
26126177-96d7-4324-aa1f-e0c363995837	5c9761cf109be8665e06f230e541955e7a25563a392a099518cd879ec394c97e	2026-05-30 16:31:21.505211+00	20260530163121_remove_phone_number_unique_user	\N	\N	2026-05-30 16:31:21.50326+00	1
442d8337-8db6-4414-9563-0ceb782a7311	cbe0df0f758b8f33c08bcb6ed8d5fbaaf576593d133b3b93c22a73ee4bdfccd7	2026-05-30 17:25:50.609223+00	20260530172550_add_role_id_to_users	\N	\N	2026-05-30 17:25:50.606826+00	1
49d2f3a2-6fc6-453d-8d00-45dd0443a020	64b227e3cb58d71c01ad907d2a1584f577c774ff4f016f41b97abf992bbdd9fb	2026-06-01 22:16:13.352715+00	20260526120000_registration_partner_id		\N	2026-06-01 22:16:13.352715+00	0
\.


--
-- Data for Name: bracketformats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bracketformats (id, name, description, "createdAt", "updatedAt") FROM stdin;
1	single Elimination	Single elimination with gold and silver medals	2026-05-26 23:35:45.732	2026-05-26 23:35:45.732
2	Double Elimination	The winner of the consolation for the gold medal.	2026-05-26 23:35:45.735	2026-05-26 23:35:45.735
3	Round Robin	All teams play against each other one time.	2026-05-26 23:35:45.736	2026-05-26 23:35:45.736
4	Double Round Robin	All teams play against each other two times.	2026-05-26 23:35:45.737	2026-05-26 23:35:45.737
\.


--
-- Data for Name: brackets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brackets (id, name, "maxTeams", "minAge", "maxAge", "minRating", "maxRating", "bracketFormatId", "scoringListId", "playoffSeedingId", "playoffMatchId", "semiFinalMatchId", "bronzeMatchId", "goldMatchId", "roundId", "tournamentId", "eventId", "poolStarted", status, "startDate", "endDate", "registrationFee", "createdAt", "updatedAt", "scoringConfig", division) FROM stdin;
1	MLP Open Challenge	16	0	0	0.00	0.00	4	4	1	4	4	4	8	4	1	1	f	draft	2026-05-27	2026-05-28	85.00	2026-05-27 03:00:04.341	2026-05-27 03:00:08.341	{"gold": {"label": "Best of 3 to 11, win by 2", "scoringListId": 8}, "pool": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "semi": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "bronze": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "playoff": {"label": "1 game to 15, win by 2", "scoringListId": 4}}	\N
2	MXD 14.0	16	0	0	0.00	0.00	4	4	1	4	4	4	8	4	1	1	f	draft	2026-05-27	2026-05-28	85.00	2026-05-27 16:27:08.987	2026-05-27 16:27:08.987	{"gold": {"label": "Best of 3 to 11, win by 2", "scoringListId": 8}, "pool": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "semi": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "bronze": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "playoff": {"label": "1 game to 15, win by 2", "scoringListId": 4}}	\N
3	MXD 16.0	16	0	0	3.00	4.00	4	4	1	4	4	4	8	4	2	1	f	draft	2026-05-30	2026-05-31	85.00	2026-05-30 14:17:38.2	2026-05-30 14:17:38.2	{"gold": {"label": "Best of 3 to 11, win by 2", "scoringListId": 8}, "pool": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "semi": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "bronze": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "playoff": {"label": "1 game to 15, win by 2", "scoringListId": 4}}	\N
4	Single 18.0	8	0	0	4.00	5.00	4	4	1	4	4	4	8	4	2	2	f	draft	2026-05-30	2026-05-31	120.00	2026-05-30 14:18:31.299	2026-05-30 14:18:31.299	{"gold": {"label": "Best of 3 to 11, win by 2", "scoringListId": 8}, "pool": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "semi": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "bronze": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "playoff": {"label": "1 game to 15, win by 2", "scoringListId": 4}}	\N
5	Single 18.0	16	0	0	0.00	0.00	4	4	1	4	4	4	8	4	1	1	f	draft	2026-05-27	2026-05-28	85.00	2026-05-30 15:34:40.377	2026-05-30 15:34:40.377	{"gold": {"label": "Best of 3 to 11, win by 2", "scoringListId": 8}, "pool": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "semi": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "bronze": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "playoff": {"label": "1 game to 15, win by 2", "scoringListId": 4}}	\N
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clubs (id, name, location, "phoneNumber", "clubType", description, "hostId", "createdAt", "updatedAt") FROM stdin;
1	Austin Pickleball Club	1435 Main St, Austin, TX 78701	(512) 555-0100	public	Sample club for local dev	2	2026-05-26 23:35:45.92	2026-05-26 23:35:45.92
2	Dallas Pickleball Association	8500 Preston Rd, Dallas, TX 75225	(469) 555-0107	public	Second sample club for local dev	2	2026-05-26 23:35:45.921	2026-05-26 23:35:45.921
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, "eventName", "createdAt", "updatedAt") FROM stdin;
1	Mixed Double's	2026-05-27 03:00:04.333	2026-05-27 03:00:04.333
2	Men's Single's	2026-05-30 14:18:31.295	2026-05-30 14:18:31.295
\.


--
-- Data for Name: formats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formats (id, name, "createdAt", "updatedAt") FROM stdin;
1	Double's	2026-05-26 23:35:45.703	2026-05-26 23:35:45.703
2	Single's	2026-05-26 23:35:45.707	2026-05-26 23:35:45.707
3	Mlp	2026-05-26 23:35:45.71	2026-05-26 23:35:45.71
4	Triples	2026-05-26 23:35:45.712	2026-05-26 23:35:45.712
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, "createdAt", "updatedAt") FROM stdin;
1	Men's	2026-05-26 23:35:45.715	2026-05-26 23:35:45.715
2	Women's	2026-05-26 23:35:45.719	2026-05-26 23:35:45.719
3	Mixed	2026-05-26 23:35:45.722	2026-05-26 23:35:45.722
4	Boys	2026-05-26 23:35:45.724	2026-05-26 23:35:45.724
5	Girls	2026-05-26 23:35:45.727	2026-05-26 23:35:45.727
6	Junior	2026-05-26 23:35:45.729	2026-05-26 23:35:45.729
\.


--
-- Data for Name: playerbrackets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playerbrackets (id, "playerId", "tournamentId", "bracketId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: playerregistrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playerregistrations (id, "playerId", "tournamentId", "bracketId", status, "paymentStatus", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "paymentEmailSentCount", "clubName", "playerRole", "rosterNumber", division, "partnerId") FROM stdin;
1	3	1	2	registered	unpaid	not_checked_in	\N	2026-05-27 16:27:23.923	2026-05-27 16:27:23.923	0	\N	\N	\N	\N	\N
2	10	1	2	registered	unpaid	not_checked_in	\N	2026-05-28 19:32:43.361	2026-05-28 19:32:43.361	0	\N	\N	\N	\N	\N
3	11	1	2	registered	unpaid	not_checked_in	\N	2026-05-29 15:54:40.563	2026-05-29 15:54:40.563	0	\N	\N	\N	\N	\N
4	12	1	2	registered	unpaid	not_checked_in	\N	2026-05-29 16:52:59.87	2026-05-29 16:52:59.87	0	\N	starter	\N	\N	\N
5	13	1	2	registered	unpaid	not_checked_in	\N	2026-05-29 16:54:45.348	2026-05-29 16:54:45.348	0	\N	starter	\N	\N	\N
6	21	1	2	registered	paid	not_checked_in	\N	2026-05-29 20:53:38.215	2026-05-29 20:53:38.215	0	\N	starter	M1	MXD 14.0	\N
7	3	1	5	registered	paid	not_checked_in	\N	2026-05-30 15:36:08.222	2026-05-30 15:36:08.222	0	\N	starter	M1	Single 18.0	\N
8	31	2	4	registered	paid	not_checked_in	\N	2026-05-30 15:41:29.96	2026-05-30 15:41:29.96	0	\N	starter	M1	Single 18.0	\N
9	32	2	4	registered	paid	not_checked_in	\N	2026-05-30 15:41:30.028	2026-05-30 15:41:30.028	0	\N	starter	M1	Single 18.0	\N
10	33	2	4	registered	paid	not_checked_in	\N	2026-05-30 15:41:30.088	2026-05-30 15:41:30.088	0	\N	starter	M1	Single 18.0	\N
11	33	2	3	registered	paid	not_checked_in	\N	2026-05-30 16:22:28.051	2026-05-30 16:22:28.051	0	\N	starter	M1	MXD 16.0	\N
12	37	2	3	registered	paid	not_checked_in	\N	2026-05-30 16:44:37.78	2026-05-30 16:44:37.78	0	\N	starter	M1	MXD 16.0	\N
13	38	2	3	registered	paid	not_checked_in	\N	2026-05-30 17:32:26.379	2026-05-30 17:32:26.379	0	\N	starter	M1	MXD 16.0	\N
14	39	1	2	registered	paid	not_checked_in	\N	2026-05-31 16:31:28.553	2026-05-31 16:31:28.553	0	\N	starter	M2	MXD 14.0	\N
15	3	2	3	registered	paid	not_checked_in	\N	2026-05-31 16:36:32.253	2026-05-31 16:36:32.253	0	\N	starter	M1	MXD 16.0	\N
16	40	2	3	registered	paid	not_checked_in	\N	2026-05-31 16:38:42.637	2026-05-31 16:38:42.637	0	\N	starter	M1	MXD 16.0	\N
17	41	2	3	registered	paid	not_checked_in	\N	2026-05-31 16:38:42.709	2026-05-31 16:38:42.709	0	\N	starter	M2	MXD 16.0	\N
\.


--
-- Data for Name: playoffseedings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playoffseedings (id, name, description, "createdAt", "updatedAt") FROM stdin;
1	Standard	Traditional top-seed vs low-seed order	2026-05-26 23:35:45.771	2026-05-26 23:35:45.771
2	Random	Randomized playoff order	2026-05-26 23:35:45.774	2026-05-26 23:35:45.774
\.


--
-- Data for Name: poolteamstats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poolteamstats (id, "poolId", "teamId", wins, losses, "pointsFor", "pointsAgainst", "pointDifference", "pdPercent", "playoffSeed", "playoffWins", "playoffPointsFor", "playoffPointsAgainst", "playoffPointDifference", "finalRank", "createdAt", "updatedAt") FROM stdin;
20	37	26	3	0	33	21	12	0.61	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
21	37	13	2	1	27	25	2	0.52	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
22	37	22	1	2	28	30	-2	0.48	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
23	37	16	0	3	18	30	-12	0.38	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
24	38	23	3	0	33	22	11	0.6	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
25	38	18	2	1	29	26	3	0.53	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
26	38	24	1	2	26	29	-3	0.47	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
27	38	28	0	3	23	34	-11	0.4	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
28	39	25	2	1	30	25	5	0.55	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
29	39	20	2	1	28	22	6	0.56	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
30	39	14	1	2	25	31	-6	0.45	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
31	39	21	1	2	23	28	-5	0.45	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
32	40	19	3	0	33	20	13	0.62	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
33	40	17	2	1	30	26	4	0.54	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
34	40	15	1	2	28	32	-4	0.47	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
35	40	27	0	3	21	34	-13	0.38	\N	0	0	0	0	\N	2026-06-11 15:09:53.72	2026-06-11 15:09:53.72
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, "createdAt", "updatedAt") FROM stdin;
1	organizer	2026-05-26 23:35:12.46	2026-05-26 23:35:12.46
2	super_admin	2026-05-26 23:35:12.46	2026-05-26 23:35:12.46
3	host	2026-05-26 23:35:45.688	2026-05-26 23:35:45.688
4	player	2026-05-26 23:35:45.695	2026-05-26 23:35:45.695
\.


--
-- Data for Name: rounds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rounds (id, "poolId", "roundNumber", status, "bracketId", type, "createdAt", "updatedAt") FROM stdin;
159	\N	1	pending	1	playoff	2026-06-12 15:59:47.549	2026-06-12 15:59:47.549
160	\N	2	pending	1	playoff	2026-06-12 15:59:47.551	2026-06-12 15:59:47.551
161	\N	3	pending	1	playoff	2026-06-12 15:59:47.553	2026-06-12 15:59:47.553
162	\N	4	pending	1	playoff	2026-06-12 15:59:47.555	2026-06-12 15:59:47.555
131	37	1	pending	1	pool	2026-06-11 19:02:05.746	2026-06-11 19:02:05.746
132	37	2	pending	1	pool	2026-06-11 19:02:05.759	2026-06-11 19:02:05.759
133	37	3	pending	1	pool	2026-06-11 19:02:05.765	2026-06-11 19:02:05.765
134	38	1	pending	1	pool	2026-06-11 19:02:05.782	2026-06-11 19:02:05.782
135	38	2	pending	1	pool	2026-06-11 19:02:05.786	2026-06-11 19:02:05.786
136	38	3	pending	1	pool	2026-06-11 19:02:05.79	2026-06-11 19:02:05.79
137	39	1	pending	1	pool	2026-06-11 19:02:05.801	2026-06-11 19:02:05.801
138	39	2	pending	1	pool	2026-06-11 19:02:05.804	2026-06-11 19:02:05.804
139	39	3	pending	1	pool	2026-06-11 19:02:05.808	2026-06-11 19:02:05.808
140	40	1	pending	1	pool	2026-06-11 19:02:05.818	2026-06-11 19:02:05.818
141	40	2	pending	1	pool	2026-06-11 19:02:05.821	2026-06-11 19:02:05.821
142	40	3	pending	1	pool	2026-06-11 19:02:05.824	2026-06-11 19:02:05.824
\.


--
-- Data for Name: scoringlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scoringlists (id, name, "createdAt", "updatedAt", rules) FROM stdin;
1	1 game to 11, win by 1	2026-05-26 23:35:45.74	2026-05-26 23:35:45.74	{"label": "1 game to 11, win by 1", "winBy": 1, "format": "single", "pointsTo": 11}
2	1 game to 11, win by 2	2026-05-26 23:35:45.743	2026-05-26 23:35:45.743	{"label": "1 game to 11, win by 2", "winBy": 2, "format": "single", "pointsTo": 11}
3	1 game to 15, win by 1	2026-05-26 23:35:45.744	2026-05-26 23:35:45.744	{"label": "1 game to 15, win by 1", "winBy": 1, "format": "single", "pointsTo": 15}
4	1 game to 15, win by 2	2026-05-26 23:35:45.746	2026-05-26 23:35:45.746	{"label": "1 game to 15, win by 2", "winBy": 2, "format": "single", "pointsTo": 15}
5	1 game to 21, win by 1	2026-05-26 23:35:45.747	2026-05-26 23:35:45.747	{"label": "1 game to 21, win by 1", "winBy": 1, "format": "single", "pointsTo": 21}
6	1 game to 21, win by 2	2026-05-26 23:35:45.748	2026-05-26 23:35:45.748	{"label": "1 game to 21, win by 2", "winBy": 2, "format": "single", "pointsTo": 21}
7	Best of 3 to 11, win by 1	2026-05-26 23:35:45.75	2026-05-26 23:35:45.75	{"games": 3, "label": "Best of 3 to 11, win by 1", "winBy": 1, "format": "best_of", "pointsTo": 11}
8	Best of 3 to 11, win by 2	2026-05-26 23:35:45.752	2026-05-26 23:35:45.752	{"games": 3, "label": "Best of 3 to 11, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 11}
9	Best of 3 to 15, win by 1	2026-05-26 23:35:45.753	2026-05-26 23:35:45.753	{"games": 3, "label": "Best of 3 to 15, win by 1", "winBy": 1, "format": "best_of", "pointsTo": 15}
10	Best of 3 to 15, win by 2	2026-05-26 23:35:45.754	2026-05-26 23:35:45.754	{"games": 3, "label": "Best of 3 to 15, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 15}
11	Best of 3 to 21, win by 2	2026-05-26 23:35:45.756	2026-05-26 23:35:45.756	{"games": 3, "label": "Best of 3 to 21, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 21}
12	Best of 5 to 11, win by 2	2026-05-26 23:35:45.757	2026-05-26 23:35:45.757	{"games": 5, "label": "Best of 5 to 11, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 11}
13	Best of 5 to 15, win by 2	2026-05-26 23:35:45.758	2026-05-26 23:35:45.758	{"games": 5, "label": "Best of 5 to 15, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 15}
14	Rally scoring to 21, win by 2	2026-05-26 23:35:45.759	2026-05-26 23:35:45.759	{"label": "Rally scoring to 21, win by 2", "winBy": 2, "format": "single", "pointsTo": 21}
15	Rally scoring to 25, win by 2	2026-05-26 23:35:45.761	2026-05-26 23:35:45.761	{"label": "Rally scoring to 25, win by 2", "winBy": 2, "format": "single", "pointsTo": 25}
16	Timed match — 20 min, point capped	2026-05-26 23:35:45.763	2026-05-26 23:35:45.763	{"label": "Timed match — 20 min, point capped", "format": "timed", "minutes": 20}
17	Timed match — 30 min, point capped	2026-05-26 23:35:45.764	2026-05-26 23:35:45.764	{"label": "Timed match — 30 min, point capped", "format": "timed", "minutes": 30}
18	Rally Scoring	2026-05-26 23:35:45.766	2026-05-26 23:35:45.766	{"label": "Rally Scoring", "winBy": 1, "format": "single", "pointsTo": 11}
19	Side-out Scoring	2026-05-26 23:35:45.767	2026-05-26 23:35:45.767	{"label": "Side-out Scoring", "winBy": 1, "format": "single", "pointsTo": 11}
\.


--
-- Data for Name: teamplayers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") FROM stdin;
1	11	1	starter	2026-05-29 15:54:40.571	2026-05-29 15:54:40.571
2	12	2	starter	2026-05-29 16:52:59.878	2026-05-29 16:52:59.878
3	13	2	starter	2026-05-29 16:54:45.353	2026-05-29 16:54:45.353
4	21	3	starter	2026-05-29 20:53:38.222	2026-05-29 20:53:38.222
5	3	4	starter	2026-05-30 15:36:08.23	2026-05-30 15:36:08.23
6	31	5	starter	2026-05-30 15:41:29.965	2026-05-30 15:41:29.965
7	32	6	starter	2026-05-30 15:41:30.032	2026-05-30 15:41:30.032
8	33	6	starter	2026-05-30 15:41:30.09	2026-05-30 15:41:30.09
9	33	7	starter	2026-05-30 16:22:28.056	2026-05-30 16:22:28.056
10	37	8	starter	2026-05-30 16:44:37.787	2026-05-30 16:44:37.787
11	38	9	starter	2026-05-30 17:32:26.382	2026-05-30 17:32:26.382
12	39	10	starter	2026-05-31 16:31:28.56	2026-05-31 16:31:28.56
13	3	11	starter	2026-05-31 16:36:32.264	2026-05-31 16:36:32.264
14	40	12	starter	2026-05-31 16:38:42.644	2026-05-31 16:38:42.644
15	41	12	starter	2026-05-31 16:38:42.711	2026-05-31 16:38:42.711
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, "teamName", "bracketId", "tournamentId", status, "paymentStatus", "isComplete", "createdAt", "updatedAt") FROM stdin;
1	Team Thunderbolts	2	1	registered	paid	f	2026-05-29 15:54:40.566	2026-05-29 15:54:40.566
2	san antonio spurs	2	1	registered	paid	f	2026-05-29 16:52:59.872	2026-05-29 16:52:59.872
3	Team A	2	1	registered	paid	f	2026-05-29 20:53:38.218	2026-05-29 20:53:38.218
4	Team Thunderbolts	5	1	registered	paid	f	2026-05-30 15:36:08.226	2026-05-30 15:36:08.226
5	Boxers	4	2	registered	paid	f	2026-05-30 15:41:29.963	2026-05-30 15:41:29.963
6	JOMG	4	2	registered	paid	f	2026-05-30 15:41:30.031	2026-05-30 15:41:30.031
7	JOMG	3	2	registered	paid	f	2026-05-30 16:22:28.054	2026-05-30 16:22:28.054
8	Boxers	3	2	registered	paid	f	2026-05-30 16:44:37.783	2026-05-30 16:44:37.783
9	Team okcthunder	3	2	registered	paid	f	2026-05-30 17:32:26.38	2026-05-30 17:32:26.38
10	TeamA	2	1	registered	paid	f	2026-05-31 16:31:28.556	2026-05-31 16:31:28.556
11	TeamA	3	2	registered	paid	f	2026-05-31 16:36:32.26	2026-05-31 16:36:32.26
12	Team B	3	2	registered	paid	f	2026-05-31 16:38:42.64	2026-05-31 16:38:42.64
13	Team Alpha	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
14	Team Bravo	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
15	Team Charlie	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
16	Team Delta	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
17	Team Echo	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
18	Team Foxtrot	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
19	Team Golf	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
20	Team Hotel	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
21	Team India	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
22	Team Juliet	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
23	Team Kilo	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
24	Team Lima	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
25	Team Mike	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
26	Team November	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
27	Team Oscar	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
28	Team Papa	1	1	registered	paid	f	2026-06-02 13:19:34.598	2026-06-02 13:19:34.598
\.


--
-- Data for Name: tournaments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tournaments (id, name, description, "entryFee", discount, "tournamentTumbnail", location, "startDate", "endDate", "registrationOpenDate", "registrationCloseDate", status, "organizerInfo", slug, "clubId", "hostId", "createdAt", "updatedAt", venue, timezone, "refundDeadline", "refundFee", "duprRecorded", "duprEnforced", "requireSkillRating") FROM stdin;
1	Test Tournament	Testing	85.00	0	\N	1435 Main St, Austin, TX 78701	2026-05-27	2026-05-28	2026-05-25	2026-05-26	draft	{"name":"Mukundan Iyengar","email":"mukundaniyengar7@gmail.com","phone":"(512) 555-0100","masterPush":false,"numCourts":8,"playEnv":"Outdoor Open","netSetup":"Permanent","officialBall":"Franklin X40","officialBallUrl":"","paymentPhone":"5863357043","settingsConfirmed":false,"settingsConfirmedAt":null,"sectionPush":{"pricing":false,"playRules":false,"dupr":false},"pricing":{"payForPartner":{"enabled":false,"mode":"optional"},"payForTeam":{"enabled":false,"mode":"optional"},"advanceTiers":[{"id":"tier-1779838688748-11","label":"Early Bird","pricePerPlayer":50,"activeUntil":""},{"id":"tier-1779838688748-12","label":"Advance Rate","pricePerPlayer":55,"activeUntil":""},{"id":"tier-1779838688748-13","label":"Pre-Deadline","pricePerPlayer":65,"activeUntil":""}],"bundles":[{"id":"tier-1779838688748-14","divisionCount":2,"mode":"pct","value":10},{"id":"tier-1779838688748-15","divisionCount":3,"mode":"pct","value":15}],"prizes":{"first":500,"second":250,"third":100,"medalsAwards":true}},"playRules":{"mlpFormat":false,"mlp":{"mensDoubles":"1 game to 11, win by 2","womensDoubles":"1 game to 11, win by 2","mixed1":"1 game to 11, win by 2","mixed2":"1 game to 11, win by 2","dreamBreaker":"1 game to 21, win by 1","rotation":"Singles rally — 1 server switches every 4 pts","trigger":"Only when games tied 2–2","rosterSize":"6 players (2M + 2F starters + 1M + 1F sub)","gameOrder":"Women's D → Men's D → Mixed 1 → Mixed 2","pointsPerGameWon":1,"scoringType":"Traditional (side-out)","warmUpMinutes":3,"substitutions":true,"coachOnCourt":false,"teamTimeouts":true},"matchScoring":{"pool":"1 game to 15, win by 2","playoff":"1 game to 15, win by 2","semi":"1 game to 15, win by 2","gold":"Best of 3 to 11, win by 2","bronze":"1 game to 15, win by 2"},"scoringType":"Traditional (side-out)","suddenDeathAt":"","suddenDeathWinAt":"","warmUpMinutes":3,"seedingMethod":"DUPR Rating (highest rating = 1 seed)","autoGeneratePools":true,"tiebreakerTo5":false,"switchSidesAtHalf":true,"top1SeedBye":true,"top12AdvanceToSemis":false,"allowRefereeRequests":true,"bronzeMatch":true},"notifications":{"matchNotifications":true,"liveScoring":true,"emailNotifications":true,"courtAssignmentText":false},"visibility":{"publicTournamentPage":true,"privateOnly":false,"showDivisionsPublicly":true,"spectatorScoreboard":true,"passwordProtected":false,"registrationPassword":"","waitlistEnabled":true}}	test-tournament	1	2	2026-05-26 23:38:08.602	2026-05-27 02:59:24.759	Austin Pickleball Club	\N	\N	0.00	t	f	f
2	Detroit Test Tournament	Testing For Jomg	0.00	0	\N	8520 Preston Rd, Dallas, TX 75225	2026-05-28	2026-05-29	2026-05-26	2026-05-27	draft	{"name":"Dallas Pickleball Association","email":"vniyen@gmail.com","phone":"(469) 555-0107","masterPush":false,"numCourts":6,"playEnv":"Mixed — Indoor & Outdoor","netSetup":"Permanent","officialBall":"","officialBallUrl":"","paymentPhone":"(248) 853-3497","settingsConfirmed":true,"settingsConfirmedAt":"2026-05-30T14:42:22.360Z","sectionPush":{"pricing":false,"playRules":false,"dupr":false},"pricing":{"payForPartner":{"enabled":false,"mode":"optional"},"payForTeam":{"enabled":false,"mode":"optional"},"advanceTiers":[{"id":"tier-1780150504855-46","label":"Early Bird","pricePerPlayer":50,"activeUntil":""},{"id":"tier-1780150504855-47","label":"Advance Rate","pricePerPlayer":55,"activeUntil":""},{"id":"tier-1780150504855-48","label":"Pre-Deadline","pricePerPlayer":65,"activeUntil":""}],"bundles":[{"id":"tier-1780150504855-49","divisionCount":2,"mode":"pct","value":10},{"id":"tier-1780150504855-50","divisionCount":3,"mode":"pct","value":15}],"prizes":{"first":500,"second":250,"third":100,"medalsAwards":true}},"playRules":{"mlpFormat":false,"mlp":{"mensDoubles":"1 game to 11, win by 2","womensDoubles":"1 game to 11, win by 2","mixed1":"1 game to 11, win by 2","mixed2":"1 game to 11, win by 2","dreamBreaker":"1 game to 21, win by 1","rotation":"Singles rally — 1 server switches every 4 pts","trigger":"Only when games tied 2–2","rosterSize":"6 players (2M + 2F starters + 1M + 1F sub)","gameOrder":"Women's D → Men's D → Mixed 1 → Mixed 2","pointsPerGameWon":1,"scoringType":"Traditional (side-out)","warmUpMinutes":3,"substitutions":true,"coachOnCourt":false,"teamTimeouts":true},"matchScoring":{"pool":"1 game to 15, win by 2","playoff":"1 game to 15, win by 2","semi":"1 game to 15, win by 2","gold":"Best of 3 to 11, win by 2","bronze":"1 game to 15, win by 2"},"scoringType":"Traditional (side-out)","suddenDeathAt":"","suddenDeathWinAt":"","warmUpMinutes":3,"seedingMethod":"DUPR Rating (highest rating = 1 seed)","autoGeneratePools":true,"tiebreakerTo5":false,"switchSidesAtHalf":true,"top1SeedBye":true,"top12AdvanceToSemis":false,"allowRefereeRequests":true,"bronzeMatch":true},"notifications":{"matchNotifications":true,"liveScoring":true,"emailNotifications":true,"courtAssignmentText":false},"visibility":{"publicTournamentPage":true,"privateOnly":false,"showDivisionsPublicly":true,"spectatorScoreboard":true,"passwordProtected":false,"registrationPassword":"","waitlistEnabled":true}}	detroit-test-tournament	2	2	2026-05-30 14:15:04.758	2026-05-30 14:42:28.956	Dallas Pickleball Association	America/New_York	2026-05-27	20.00	t	f	f
\.


--
-- Data for Name: userroles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") FROM stdin;
1	1	2	2026-05-26 23:35:45.915	2026-05-26 23:35:45.915
2	2	1	2026-05-26 23:35:45.917	2026-05-26 23:35:45.917
3	3	4	2026-05-27 16:27:23.92	2026-05-27 16:27:23.92
4	10	4	2026-05-28 19:32:43.355	2026-05-28 19:32:43.355
5	11	4	2026-05-29 15:54:40.558	2026-05-29 15:54:40.558
6	12	4	2026-05-29 16:52:59.866	2026-05-29 16:52:59.866
7	13	4	2026-05-29 16:54:45.343	2026-05-29 16:54:45.343
15	21	4	2026-05-29 20:53:38.21	2026-05-29 20:53:38.21
16	31	4	2026-05-30 15:41:29.956	2026-05-30 15:41:29.956
17	32	4	2026-05-30 15:41:30.025	2026-05-30 15:41:30.025
18	33	4	2026-05-30 15:41:30.086	2026-05-30 15:41:30.086
19	37	4	2026-05-30 16:44:37.776	2026-05-30 16:44:37.776
20	38	4	2026-05-30 17:32:26.377	2026-05-30 17:32:26.377
21	39	4	2026-05-31 16:31:28.549	2026-05-31 16:31:28.549
22	40	4	2026-05-31 16:38:42.632	2026-05-31 16:38:42.632
23	41	4	2026-05-31 16:38:42.707	2026-05-31 16:38:42.707
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "createdAt", "updatedAt", "tokenVersion", "duprId", facebook, instagram, "paymentMethod", "paymentStatus", "roleId", "duprRating") FROM stdin;
1	Super	Admin	admin@jomg.com	$2b$10$6M9pfAP3vWe5bBI9S3rrP.hXI9SaiTdQu3vgewi.zyP8pdqAQMxPu	local	\N	\N	30	male	+10000000001	t	\N	\N	\N	\N	2026-05-26 23:35:45.858	2026-05-26 23:35:45.858	0	\N	\N	\N	\N	\N	\N	\N
10	Mukundan		alfdsx@example.com	$2b$10$L6myvbk9kNYrmIY0ZDJ4repdWNFHlRSKoERKQYpbQEOYrBO8rZsba	local	\N	\N	34	male	(512) 551-0100	f	87b1c33cf646465d6912ae86759e6df705791f62fd6fdc1a5190f676ea0be6b8	\N	\N	2026-05-29 19:32:43.347	2026-05-28 19:32:43.349	2026-05-28 19:32:43.349	0	\N	\N	\N	\N	\N	\N	\N
11	VASU		aldsfsex@example.com	$2b$10$NTcA5XYFk0BjnObjYk6Ii.hK2RnNxCESL.IRNWJi6qAXIQPTgvzke	local	\N	\N	30	male	(522) 555-0100	f	9fba2bc81a7e41f68145774d94abe4ae15a34f8b35275124732138676902f148	\N	\N	2026-05-30 15:54:40.551	2026-05-29 15:54:40.552	2026-05-29 15:54:40.552	0	\N	\N	\N	\N	\N	\N	\N
12	Victor	wetbananas	wemby@example.com	$2b$10$OKCnwS3SNMeQwEAsFtTc5OGtBzZ5SQj3P2GI6W0QhXsIM2AeDLVPW	local	\N	\N	30	male	(112) 555-0100	f	acb2d9895bbd5775d103c78af9a077a5c34f0ca339492922ddb4b7a1fa29c3b3	\N	\N	2026-05-30 16:52:59.861	2026-05-29 16:52:59.862	2026-05-29 16:52:59.862	0	4.20	facfsdbook.com/alexturner	wetbanans	\N	\N	\N	\N
13	Victor	wetbananas	we43mby@example.com	$2b$10$u1NAP.dg2x8enQzLvSkea.UgX80hQB5a6rzQJTfOPJobMyoSPTr06	local	\N	\N	30	male	(112) 455-0100	f	8957f8b0d0fd042b42319d70c67efa9eb916c1e2be0c784184a622092fd90fa0	\N	\N	2026-05-30 16:54:45.338	2026-05-29 16:54:45.338	2026-05-29 16:54:45.338	0	4.20	facfsdbook.com/alexturner	wetbanans	\N	\N	\N	\N
21	JOEMAMA		joe@example.com	$2b$10$phxevPgfDRcqwyhL3JNyKu9Ro4P4Y.rDXC.gp/Zdkg9/jVMJDIT76	local	\N	\N	30	male	(512) 535-0100	f	0addb06e17f7c9061abd434c3e8d4c013f28313e93ae7d9d9be74854e979f47b	\N	\N	2026-05-30 20:53:38.199	2026-05-29 20:53:38.2	2026-05-29 20:53:38.2	0	4.20	facebook.com/aleturner	JOE	Stripe	unpaid	\N	\N
2	Default	Organizer	organizer@jomg.com	$2b$10$OArqWMERjwSRbw7iS7Gi8.9sHXvir.oVDPorx.D.C.htj8uJG8MTm	local	\N	\N	28	male	+10000000002	t	\N	\N	\N	\N	2026-05-26 23:35:45.914	2026-06-10 20:14:27.052	1	\N	\N	\N	\N	\N	\N	\N
3	Alex	Turner	alex@example.com	$2b$10$Fxr7Nr5XOhYLWrWRUingqOPfX2EjTV.ZyZ9hFAYJBT/DOzk0QxpqW	local	\N	\N	34	male	(512) 555-0100	f	0b35fc6726ec119f2e4cb4a289feba8a7a502f6b327a2a829e76dba63b408a0c	\N	\N	2026-05-28 16:27:23.915	2026-05-27 16:27:23.916	2026-05-30 15:35:58.838	0	4.20	facebook.com/alexturner	@alexturner	Stripe	unpaid	\N	\N
31	bobby	Macedo	bobby@example.com	$2b$10$qEKlKUZRh3DrqSMkZT7a3unMF0DAQzjEQcI5Zi0YnqhNXDe3lUwU6	local	\N	\N	30	male	(512) 555-0102	f	56086b2e143eb6f747683763346e3cb37f6584934881f9cd79d1062398299996	\N	\N	2026-05-31 15:41:29.952	2026-05-30 15:41:29.953	2026-05-30 15:41:29.953	0	4	y	x	Stripe	unpaid	\N	\N
32	Vasu	Iyengar	vn@example.com	$2b$10$mrxUbzZlGFtFarW.kefjDei2UevtGDj.ykHMEkp3imfimzT4MKsY6	local	\N	\N	30	male	(512) 555-0103	f	f07b9aac33fcdd4a222641fe4b29aa05d7984050155359a16a9f96bf19c3f40f	\N	\N	2026-05-31 15:41:30.023	2026-05-30 15:41:30.023	2026-05-30 15:41:30.023	0	4	y	x	Stripe	unpaid	\N	\N
33	Muku	Iyengar	muku@example.com	$2b$10$MSFfHTVN.SxhV7jLR/aZ/.q7rONUjrdltATFAClGrN5ED5eAHcuta	local	\N	\N	30	male	(512) 555-0104	f	e02f2fd94843a2f7506a8d56bacc1115c5ee1d78e9a9f8a95f455ececa1f698c	\N	\N	2026-05-31 15:41:30.084	2026-05-30 15:41:30.084	2026-05-30 15:41:30.084	0	4	y	x	Stripe	unpaid	\N	\N
37	John	Prabhu	john@example.com	$2b$10$95C9dUpOxqxjHS.D/4uiSOReRAQPCdFI0uEXAQQqB5J3xno4jzT/6	local	\N	\N	30	male	(512) 555-0104	f	a3952b6d072868e27beb3331d7d040326bee589a792540c5806b520866e04277	\N	\N	2026-05-31 16:44:37.77	2026-05-30 16:44:37.771	2026-05-30 16:44:37.771	0	4	y	x	Stripe	unpaid	\N	\N
38	shai		alsahx@example.com	$2b$10$1cmU1K8EFBSCl7jO4ucbLOVM0pd.E9KPxQS478//hkMxO/wT3cIPS	local	\N	\N	30	female	(512) 115-0100	f	3433f2f69cb8fb86f914082e487389728e367444176f1a2dddc8591bf68fe379	\N	\N	2026-05-31 17:32:26.371	2026-05-30 17:32:26.373	2026-05-30 17:32:26.373	0	4.20	y	x	Stripe	unpaid	4	\N
39	james		x@gmail.com	$2b$10$8busAcLTW5cTmfHRD8II/.b7My7Jp81lHLikQpK1aw39WMjIvd2Uy	local	\N	\N	30	male	(512) 555-0100	f	766ef2e76c87e8cf98d3e831e9600fb8f80fc0623eeaf390c12bcc27360b1dbf	\N	\N	2026-06-01 16:31:28.544	2026-05-31 16:31:28.544	2026-05-31 16:31:28.544	0	5.1	z	y	cash	unpaid	4	\N
40	SDAF		x@exple.com	$2b$10$bXW2QmLxeH1cRTCETmvKZeHBSjsnlZnnCY0ABKKma0hLafWHVvl8m	local	\N	\N	30	male	(532) 555-0100	f	46cf375fcfcb8118538ca2e2e8c02ebabea6514312d6799a424eac9782c5128f	\N	\N	2026-06-01 16:38:42.626	2026-05-31 16:38:42.626	2026-05-31 16:38:42.626	0	4.2	faceook.com/alexturner	alexturner	Stripe	unpaid	4	\N
41	SDAC		joedfsdsf@gmail.com	$2b$10$81FYE1HeFXNeFBkczutqCul1nhovWRzfW63sHjkcIkGUdYC4AGL5S	local	\N	\N	30	male	(532) 555-0100	f	c596d56caaf184743043b25f995fb77a3b0ec014bd2b5a4d3dfde3d80b01599d	\N	\N	2026-06-01 16:38:42.704	2026-05-31 16:38:42.704	2026-05-31 16:38:42.704	0	4.2	faceook.om/alexturner	alextrner	Stripe	unpaid	4	\N
\.


--
-- Name: Matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Matches_id_seq"', 323, true);


--
-- Name: Pool_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Pool_id_seq"', 40, true);


--
-- Name: bracketformats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bracketformats_id_seq', 4, true);


--
-- Name: brackets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brackets_id_seq', 9, true);


--
-- Name: clubs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clubs_id_seq', 2, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 2, true);


--
-- Name: formats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formats_id_seq', 4, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 6, true);


--
-- Name: playerbrackets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playerbrackets_id_seq', 1, false);


--
-- Name: playerregistrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playerregistrations_id_seq', 17, true);


--
-- Name: playoffseedings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playoffseedings_id_seq', 2, true);


--
-- Name: poolteamstats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.poolteamstats_id_seq', 35, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: rounds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rounds_id_seq', 162, true);


--
-- Name: scoringlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scoringlists_id_seq', 19, true);


--
-- Name: teamplayers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teamplayers_id_seq', 15, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 28, true);


--
-- Name: tournaments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tournaments_id_seq', 2, true);


--
-- Name: userroles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userroles_id_seq', 23, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 41, true);


--
-- Name: Matches Matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Matches"
    ADD CONSTRAINT "Matches_pkey" PRIMARY KEY (id);


--
-- Name: PoolTeam PoolTeam_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PoolTeam"
    ADD CONSTRAINT "PoolTeam_pkey" PRIMARY KEY ("poolId", "teamId");


--
-- Name: Pool Pool_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pool"
    ADD CONSTRAINT "Pool_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: bracketformats bracketformats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bracketformats
    ADD CONSTRAINT bracketformats_pkey PRIMARY KEY (id);


--
-- Name: brackets brackets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brackets
    ADD CONSTRAINT brackets_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: formats formats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formats
    ADD CONSTRAINT formats_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: playerbrackets playerbrackets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerbrackets
    ADD CONSTRAINT playerbrackets_pkey PRIMARY KEY (id);


--
-- Name: playerregistrations playerregistrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerregistrations
    ADD CONSTRAINT playerregistrations_pkey PRIMARY KEY (id);


--
-- Name: playoffseedings playoffseedings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playoffseedings
    ADD CONSTRAINT playoffseedings_pkey PRIMARY KEY (id);


--
-- Name: poolteamstats poolteamstats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poolteamstats
    ADD CONSTRAINT poolteamstats_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: rounds rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_pkey PRIMARY KEY (id);


--
-- Name: scoringlists scoringlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scoringlists
    ADD CONSTRAINT scoringlists_pkey PRIMARY KEY (id);


--
-- Name: teamplayers teamplayers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teamplayers
    ADD CONSTRAINT teamplayers_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: tournaments tournaments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournaments
    ADD CONSTRAINT tournaments_pkey PRIMARY KEY (id);


--
-- Name: userroles userroles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userroles
    ADD CONSTRAINT userroles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bracketformats_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bracketformats_name_key ON public.bracketformats USING btree (name);


--
-- Name: events_eventName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "events_eventName_key" ON public.events USING btree ("eventName");


--
-- Name: formats_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX formats_name_key ON public.formats USING btree (name);


--
-- Name: groups_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX groups_name_key ON public.groups USING btree (name);


--
-- Name: poolteamstats_poolId_teamId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "poolteamstats_poolId_teamId_key" ON public.poolteamstats USING btree ("poolId", "teamId");


--
-- Name: poolteamstats_poolId_wins_pointDifference_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "poolteamstats_poolId_wins_pointDifference_idx" ON public.poolteamstats USING btree ("poolId", wins, "pointDifference");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: scoringlists_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX scoringlists_name_key ON public.scoringlists USING btree (name);


--
-- Name: teamplayers_playerId_teamId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "teamplayers_playerId_teamId_key" ON public.teamplayers USING btree ("playerId", "teamId");


--
-- Name: tournaments_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tournaments_slug_key ON public.tournaments USING btree (slug);


--
-- Name: userroles_userId_roleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "userroles_userId_roleId_key" ON public.userroles USING btree ("userId", "roleId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: Matches Matches_poolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Matches"
    ADD CONSTRAINT "Matches_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES public."Pool"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Matches Matches_roundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Matches"
    ADD CONSTRAINT "Matches_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES public.rounds(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Matches Matches_team1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Matches"
    ADD CONSTRAINT "Matches_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Matches Matches_team2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Matches"
    ADD CONSTRAINT "Matches_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PoolTeam PoolTeam_poolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PoolTeam"
    ADD CONSTRAINT "PoolTeam_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES public."Pool"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PoolTeam PoolTeam_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PoolTeam"
    ADD CONSTRAINT "PoolTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Pool Pool_bracketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pool"
    ADD CONSTRAINT "Pool_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES public.brackets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Pool Pool_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pool"
    ADD CONSTRAINT "Pool_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public.tournaments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: brackets brackets_bracketFormatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brackets
    ADD CONSTRAINT "brackets_bracketFormatId_fkey" FOREIGN KEY ("bracketFormatId") REFERENCES public.bracketformats(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: brackets brackets_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brackets
    ADD CONSTRAINT "brackets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: brackets brackets_playoffSeedingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brackets
    ADD CONSTRAINT "brackets_playoffSeedingId_fkey" FOREIGN KEY ("playoffSeedingId") REFERENCES public.playoffseedings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: brackets brackets_scoringListId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brackets
    ADD CONSTRAINT "brackets_scoringListId_fkey" FOREIGN KEY ("scoringListId") REFERENCES public.scoringlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: brackets brackets_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brackets
    ADD CONSTRAINT "brackets_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public.tournaments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clubs clubs_hostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT "clubs_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playerregistrations playerregistrations_bracketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerregistrations
    ADD CONSTRAINT "playerregistrations_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES public.brackets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playerregistrations playerregistrations_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerregistrations
    ADD CONSTRAINT "playerregistrations_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: playerregistrations playerregistrations_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerregistrations
    ADD CONSTRAINT "playerregistrations_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playerregistrations playerregistrations_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playerregistrations
    ADD CONSTRAINT "playerregistrations_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public.tournaments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolteamstats poolteamstats_poolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poolteamstats
    ADD CONSTRAINT "poolteamstats_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES public."Pool"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolteamstats poolteamstats_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poolteamstats
    ADD CONSTRAINT "poolteamstats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rounds rounds_bracketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT "rounds_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES public.brackets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: rounds rounds_poolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT "rounds_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES public."Pool"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teamplayers teamplayers_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teamplayers
    ADD CONSTRAINT "teamplayers_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teamplayers teamplayers_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teamplayers
    ADD CONSTRAINT "teamplayers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teams teams_bracketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES public.brackets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teams teams_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public.tournaments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tournaments tournaments_clubId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournaments
    ADD CONSTRAINT "tournaments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tournaments tournaments_hostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournaments
    ADD CONSTRAINT "tournaments_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: userroles userroles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userroles
    ADD CONSTRAINT "userroles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: userroles userroles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userroles
    ADD CONSTRAINT "userroles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict koo2300srtsY2xzQwyngqDHgkJJzDisYnsdFc8QKg3Fw41Fei2p1mkEj9Jrbdw1

