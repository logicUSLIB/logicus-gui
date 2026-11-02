module DeductionProcessors exposing (processDeduction)

{-| The DEDUCTION panel: it checks proofs with the rules of an exercise and gives the rules that can be used, with
LogicUS.PL.Deduction (propositional exercises) and LogicUS.FOL.Deduction (first-order exercises).

The request is a JSON object:

  - `action`: `"presets"` (the systems of the libraries, by language), `"rules"` (it reads the rules, to save them),
    `"check"` or `"hints"`;
  - `lang`: `"PL"` or `"FOL"`; `rules`: the rules, as text; `premises`: a formula per line; `goal`: a formula;
  - `proof`: the proof, as text (Fitch style); `target`: a formula for the backward hints (optional).

-}

import Json.Decode as JSOND
import Json.Encode as JSONE
import LogicUS.FOL.Deduction as D
import LogicUS.FOL.DeductionSystems as DS
import LogicUS.PL.Deduction as PLD
import LogicUS.PL.DeductionSystems as PLDS


type alias Request =
    { action : String
    , lang : String
    , rules : String
    , premises : String
    , goal : String
    , proof : String
    , target : String
    }


decoder : JSOND.Decoder Request
decoder =
    let
        field name =
            JSOND.oneOf [ JSOND.field name JSOND.string, JSOND.succeed "" ]
    in
    JSOND.map7 Request
        (field "action")
        (field "lang")
        (field "rules")
        (field "premises")
        (field "goal")
        (field "proof")
        (field "target")


processDeduction : String -> { errorCode : Int, message : JSONE.Value }
processDeduction content =
    case JSOND.decodeString decoder content of
        Err e ->
            { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }

        Ok req ->
            { errorCode = 0, message = answer req }


answer : Request -> JSONE.Value
answer req =
    case ( req.action, req.lang ) of
        ( "presets", _ ) ->
            let
                encodePresets ps =
                    JSONE.list (\p -> JSONE.object [ ( "name", JSONE.string p.name ), ( "description", JSONE.string p.description ), ( "rules", JSONE.string p.rules ) ]) ps
            in
            JSONE.object [ ( "presets", JSONE.object [ ( "PL", encodePresets PLDS.presets ), ( "FOL", encodePresets DS.presets ) ] ) ]

        ( _, "FOL" ) ->
            answerFOL req

        _ ->
            answerPL req


answerPL : Request -> JSONE.Value
answerPL req =
    case PLD.readSystem req.rules of
        Err e ->
            JSONE.object [ ( "systemError", JSONE.string e ) ]

        Ok sys ->
            let
                exercise =
                    parse PLD.readFormula req

                problem =
                    { premises = exercise.premises, goal = exercise.goal }

                lines =
                    PLD.readProof req.proof

                rule r =
                    JSONE.object
                        [ ( "name", JSONE.string r.name )
                        , ( "text", JSONE.string (PLD.ruleToString r) )
                        , ( "counterexample"
                          , case PLD.ruleCounterexample r of
                                Just v ->
                                    JSONE.list (\( m, b ) -> JSONE.list identity [ JSONE.string m, JSONE.bool b ]) v

                                Nothing ->
                                    JSONE.null
                          )
                        , ( "closes"
                          , JSONE.bool
                                (List.any
                                    (\p ->
                                        case p of
                                            PLD.PSubproof _ _ ->
                                                True

                                            _ ->
                                                False
                                    )
                                    r.premises
                                )
                          )
                        ]

                kind k =
                    case k of
                        PLD.Forward ->
                            "forward"

                        PLD.CloseSubproof ->
                            "close"

                        PLD.Backward ->
                            "backward"
            in
            case ( req.action, duplicated (PLD.findRule sys) sys ) of
                ( "rules", Just name ) ->
                    JSONE.object [ ( "systemError", JSONE.string ("two rules are called " ++ name) ) ]

                ( "rules", Nothing ) ->
                    JSONE.object [ ( "rules", JSONE.list rule sys ) ]

                _ ->
                    JSONE.object
                        (( "rules", JSONE.list rule sys )
                            :: ( "formulaErrors", JSONE.list JSONE.string exercise.errors )
                            :: (if req.action == "hints" then
                                    [ ( "hints", JSONE.list (\h -> encodeHint (kind h.kind) h) (PLD.hints sys problem lines exercise.target 12) ) ]

                                else
                                    encodeReport PLD.formulaToString lines (PLD.checkProof sys problem lines)
                               )
                        )


answerFOL : Request -> JSONE.Value
answerFOL req =
    case D.readSystem req.rules of
        Err e ->
            JSONE.object [ ( "systemError", JSONE.string e ) ]

        Ok sys ->
            let
                exercise =
                    parse D.readFormula req

                problem =
                    { premises = exercise.premises, goal = exercise.goal }

                lines =
                    D.readProof req.proof

                rule r =
                    JSONE.object
                        [ ( "name", JSONE.string r.name )
                        , ( "text", JSONE.string (D.ruleToString r) )
                        , ( "counterexample", JSONE.null )
                        , ( "closes"
                          , JSONE.bool
                                (List.any
                                    (\p ->
                                        case p of
                                            D.PSubproof _ _ ->
                                                True

                                            _ ->
                                                False
                                    )
                                    r.premises
                                )
                          )
                        ]

                kind k =
                    case k of
                        D.Forward ->
                            "forward"

                        D.CloseSubproof ->
                            "close"

                        D.Backward ->
                            "backward"
            in
            case ( req.action, duplicated (D.findRule sys) sys ) of
                ( "rules", Just name ) ->
                    JSONE.object [ ( "systemError", JSONE.string ("two rules are called " ++ name) ) ]

                ( "rules", Nothing ) ->
                    JSONE.object [ ( "rules", JSONE.list rule sys ) ]

                _ ->
                    JSONE.object
                        (( "rules", JSONE.list rule sys )
                            :: ( "formulaErrors", JSONE.list JSONE.string exercise.errors )
                            :: (if req.action == "hints" then
                                    [ ( "hints", JSONE.list (\h -> encodeHint (kind h.kind) h) (D.hints sys problem lines exercise.target 12) ) ]

                                else
                                    encodeReport D.formulaToString lines (D.checkProof sys problem lines)
                               )
                        )



-- The name of a rule that is not the first one with its name (findRule does not distinguish upper and lower case
-- nor the ASCII forms of the connectives), if any.


duplicated : (String -> Maybe { r | name : String }) -> List { r | name : String } -> Maybe String
duplicated find rules =
    rules
        |> List.filter (\r -> find r.name /= Just r)
        |> List.head
        |> Maybe.map .name



-- The premises, goal and target of the request, read with the reader of the language, and the errors.


type alias Exercise f =
    { premises : List f
    , goal : Maybe f
    , target : Maybe f
    , errors : List String
    }


parse : (String -> Result String f) -> Request -> Exercise f
parse read req =
    let
        optional s =
            if String.isEmpty (String.trim s) then
                Nothing

            else
                Just s

        premises =
            req.premises
                |> String.lines
                |> List.map String.trim
                |> List.filter (not << String.isEmpty)
                |> List.map (\s -> ( s, read s ))

        goal =
            Maybe.map (\s -> ( s, read s )) (optional req.goal)
    in
    { premises = List.filterMap (Result.toMaybe << Tuple.second) premises
    , goal = Maybe.andThen (Result.toMaybe << Tuple.second) goal
    , target = Maybe.andThen (Result.toMaybe << read) (optional req.target)
    , errors =
        List.filterMap
            (\( s, r ) ->
                case r of
                    Err e ->
                        Just (s ++ ": " ++ e)

                    Ok _ ->
                        Nothing
            )
            (premises ++ List.filterMap identity [ goal ])
    }


encodeHint : String -> { a | rule : String, refs : String, result : String, input : String, needs : List String, assumptions : List String, text : String } -> JSONE.Value
encodeHint kind h =
    JSONE.object
        [ ( "kind", JSONE.string kind )
        , ( "rule", JSONE.string h.rule )
        , ( "refs", JSONE.string h.refs )
        , ( "result", JSONE.string h.result )
        , ( "input", JSONE.string h.input )
        , ( "needs", JSONE.list JSONE.string h.needs )
        , ( "assumptions", JSONE.list JSONE.string h.assumptions )
        , ( "text", JSONE.string h.text )
        ]


encodeReport :
    (f -> String)
    -> List { depth : Int, formula : String, rule : String, refs : String }
    -> { lines : List { number : Int, formula : Maybe f, ok : Bool, message : String }, complete : Bool, message : String }
    -> List ( String, JSONE.Value )
encodeReport toString lines report =
    [ ( "complete", JSONE.bool report.complete )
    , ( "message", JSONE.string report.message )
    , ( "lines"
      , JSONE.list identity
            (List.map2
                (\l r ->
                    JSONE.object
                        [ ( "number", JSONE.int r.number )
                        , ( "depth", JSONE.int l.depth )
                        , ( "formula", JSONE.string (Maybe.withDefault l.formula (Maybe.map toString r.formula)) )
                        , ( "rule", JSONE.string l.rule )
                        , ( "refs", JSONE.string l.refs )
                        , ( "ok", JSONE.bool r.ok )
                        , ( "message", JSONE.string r.message )
                        ]
                )
                lines
                report.lines
            )
      )
    ]
