module DeductionProcessors exposing (processDeduction)

{-| The DEDUCTION panel: it checks proofs with the rules of an exercise and gives the rules that can be used, with
LogicUS.FOL.Deduction.

The request is a JSON object:

  - `action`: `"presets"` (the systems of the library), `"check"` or `"hints"`;
  - `lang`: `"PL"` or `"FOL"`; `rules`: the rules, as text; `premises`: a formula per line; `goal`: a formula;
  - `proof`: the proof, as text (Fitch style); `target`: a formula for the backward hints (optional).

-}

import Json.Decode as JSOND
import Json.Encode as JSONE
import LogicUS.FOL.Deduction as D
import LogicUS.FOL.DeductionSystems as DS


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
    let
        lang =
            if req.lang == "FOL" then
                D.FOL

            else
                D.PL

        readAll texts =
            List.map (\s -> ( s, D.readFormula lang s )) texts

        premises =
            req.premises
                |> String.lines
                |> List.map String.trim
                |> List.filter (not << String.isEmpty)
                |> readAll

        goal =
            if String.isEmpty (String.trim req.goal) then
                Nothing

            else
                Just (D.readFormula lang req.goal)

        target =
            if String.isEmpty (String.trim req.target) then
                Nothing

            else
                Result.toMaybe (D.readFormula lang req.target)

        problem =
            { premises = List.filterMap (Result.toMaybe << Tuple.second) premises
            , goal = Maybe.andThen Result.toMaybe goal
            }

        formulaErrors =
            List.filterMap
                (\( s, r ) ->
                    case r of
                        Err e ->
                            Just (s ++ ": " ++ e)

                        Ok _ ->
                            Nothing
                )
                (premises
                    ++ (case goal of
                            Just g ->
                                [ ( req.goal, g ) ]

                            Nothing ->
                                []
                       )
                )

        lines =
            D.readProof req.proof

        ruleJson r =
            JSONE.object [ ( "name", JSONE.string r.name ), ( "text", JSONE.string (D.ruleToString r) ) ]
    in
    case req.action of
        "presets" ->
            JSONE.object
                [ ( "presets"
                  , JSONE.list
                        (\p -> JSONE.object [ ( "name", JSONE.string p.name ), ( "description", JSONE.string p.description ), ( "rules", JSONE.string p.rules ) ])
                        DS.presets
                  )
                ]

        _ ->
            case D.readSystem req.rules of
                Err e ->
                    JSONE.object [ ( "systemError", JSONE.string e ) ]

                Ok sys ->
                    let
                        common =
                            [ ( "rules", JSONE.list ruleJson sys )
                            , ( "formulaErrors", JSONE.list JSONE.string formulaErrors )
                            ]
                    in
                    if req.action == "hints" then
                        JSONE.object
                            (common
                                ++ [ ( "hints"
                                     , JSONE.list
                                        (\h ->
                                            JSONE.object
                                                [ ( "kind"
                                                  , JSONE.string
                                                        (case h.kind of
                                                            D.Forward ->
                                                                "forward"

                                                            D.CloseSubproof ->
                                                                "close"

                                                            D.Backward ->
                                                                "backward"
                                                        )
                                                  )
                                                , ( "rule", JSONE.string h.rule )
                                                , ( "refs", JSONE.string h.refs )
                                                , ( "result", JSONE.string h.result )
                                                , ( "input", JSONE.string h.input )
                                                , ( "needs", JSONE.list JSONE.string h.needs )
                                                , ( "assumptions", JSONE.list JSONE.string h.assumptions )
                                                , ( "text", JSONE.string h.text )
                                                ]
                                        )
                                        (D.hints sys lang problem lines target 12)
                                     )
                                   ]
                            )

                    else
                        let
                            report =
                                D.checkProof sys lang problem lines
                        in
                        JSONE.object
                            (common
                                ++ [ ( "complete", JSONE.bool report.complete )
                                   , ( "message", JSONE.string report.message )
                                   , ( "lines"
                                     , JSONE.list identity
                                        (List.map2
                                            (\l r ->
                                                JSONE.object
                                                    [ ( "number", JSONE.int r.number )
                                                    , ( "depth", JSONE.int l.depth )
                                                    , ( "formula"
                                                      , JSONE.string (Maybe.withDefault l.formula (Maybe.map D.formulaToString r.formula))
                                                      )
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
                            )
