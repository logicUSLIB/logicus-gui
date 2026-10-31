module ProverProcessors exposing (ProverProblem, processMace4Models, processProverProblem)

{-| Processors for the nodes that call automated provers (Prover9, Mace4 and E).

The provers themselves run in the browser (see provers/runner.js). The core builds their input from the FOL sets of
the schema and reads the models found by Mace4 back, so they can be shown and checked against the formulas.

-}

import Dict exposing (Dict)
import Json.Decode as JSOND
import Json.Encode as JSONE
import LogicUS.FOL.Prover9Mace4 as P9M4
import LogicUS.FOL.SyntaxSemantics as SS exposing (FormulaFOL(..), L_Structure, SetFOL)
import LogicUS.FOL.TPTP as TPTP
import Set


{-| A problem sent to a prover: the assumptions, the goals and the input in the language of the prover.
-}
type alias ProverProblem =
    { assumptions : SetFOL
    , goals : SetFOL
    , p9m4 : P9M4.P9M4Problem
    }


{-| It builds the input of a prover from the sets connected to the node.

The content is `{ a, g, language }`, where `a` and `g` are the sources of the assumptions and the goals, and
`language` is `"ladr"` (Prover9 and Mace4) or `"tptp"` (E). The goals are proved together: the input has a single
goal, their conjunction (with no goals, Prover9 and E look for a contradiction in the assumptions and Mace4 for a model
of them). Free variables are universally quantified.

-}
processProverProblem : String -> Dict ( Int, Int ) SetFOL -> { errorCode : Int, result : Maybe ProverProblem, message : JSONE.Value }
processProverProblem content outputsSFOL =
    let
        contentDecoder =
            JSOND.map3 (\a g l -> { a = a, g = g, language = l })
                (JSOND.field "a" JSOND.string)
                (JSOND.field "g" JSOND.string)
                (JSOND.field "language" JSOND.string)

        sourceDecoder =
            JSOND.map2 Tuple.pair (JSOND.field "origin_id" JSOND.int) (JSOND.field "origin_slot" JSOND.int)

        error code msg =
            { errorCode = code, result = Nothing, message = JSONE.string msg }

        sourceToString ( i, s ) =
            "(" ++ String.fromInt i ++ ", " ++ String.fromInt s ++ ")"
    in
    case JSOND.decodeString contentDecoder content of
        Err e ->
            error 3 (JSOND.errorToString e)

        Ok c ->
            case ( JSOND.decodeString sourceDecoder c.a, JSOND.decodeString sourceDecoder c.g ) of
                ( Ok a, Ok g ) ->
                    case ( Dict.get a outputsSFOL, Dict.get g outputsSFOL ) of
                        ( Just sourceAssumptions, Just sourceGoals ) ->
                            let
                                -- free variables are read as universally quantified, as the provers do
                                assumptions =
                                    List.map SS.ffolUniversalClosure sourceAssumptions

                                goals =
                                    List.map SS.ffolUniversalClosure sourceGoals

                                goal =
                                    conjunction goals

                                problem =
                                    { assumptions = assumptions
                                    , goals = goals
                                    , p9m4 = P9M4.p9m4Problem { assumptions = assumptions, goals = Maybe.withDefault [] (Maybe.map List.singleton goal) }
                                    }

                                input =
                                    if c.language == "tptp" then
                                        (TPTP.tptpProblem { axioms = assumptions, conjecture = goal }).input

                                    else
                                        problem.p9m4.input
                            in
                            { errorCode = 0
                            , result = Just problem
                            , message = JSONE.object [ ( "kind", JSONE.string "problem" ), ( "input", JSONE.string input ) ]
                            }

                        ( Nothing, _ ) ->
                            error 2 ("Unknown source: " ++ sourceToString a)

                        ( _, Nothing ) ->
                            error 2 ("Unknown source: " ++ sourceToString g)

                ( Err e, _ ) ->
                    error 3 (JSOND.errorToString e)

                ( _, Err e ) ->
                    error 3 (JSOND.errorToString e)


conjunction : SetFOL -> Maybe FormulaFOL
conjunction fs =
    case fs of
        [] ->
            Nothing

        f :: rest ->
            Just (List.foldl (\g acc -> Conj acc g) f rest)


{-| It reads the models of a Mace4 output (content `{ output }`) for the problem of the node, and gives them as HTML
tables together with the truth value of every assumption and goal in each model.
-}
processMace4Models : String -> Maybe ProverProblem -> { errorCode : Int, message : JSONE.Value }
processMace4Models content problem =
    case ( JSOND.decodeString (JSOND.field "output" JSOND.string) content, problem ) of
        ( Err e, _ ) ->
            { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }

        ( _, Nothing ) ->
            { errorCode = 2, message = JSONE.string "The problem of this node is not available: run the node again." }

        ( Ok output, Just p ) ->
            let
                models =
                    P9M4.mace4Models p.p9m4 output
            in
            { errorCode = 0
            , message =
                JSONE.object
                    [ ( "kind", JSONE.string "models" )
                    , ( "sizes", JSONE.list (\( u, _ ) -> JSONE.int (Set.size u)) models )
                    , ( "html", JSONE.string (String.concat (List.indexedMap (modelToHtml p) models)) )
                    ]
            }



-- HTML


escape : String -> String
escape =
    String.replace "&" "&amp;" >> String.replace "<" "&lt;" >> String.replace ">" "&gt;"


cell : String -> String -> String
cell tag content =
    "<" ++ tag ++ ">" ++ escape content ++ "</" ++ tag ++ ">"


row : String -> List String -> String
row tag cells =
    "<tr>" ++ String.concat (List.map (cell tag) cells) ++ "</tr>"


table : List String -> List (List String) -> String
table header rows =
    "<table class=\"lus-model-table\"><thead>" ++ row "th" header ++ "</thead><tbody>" ++ String.concat (List.map (row "td") rows) ++ "</tbody></table>"


modelToHtml : ProverProblem -> Int -> L_Structure Int -> String
modelToHtml problem index (( universe, i ) as m) =
    let
        elements =
            Set.toList universe

        el =
            String.fromInt

        name id =
            SS.identToString id

        problemConstants =
            List.concatMap SS.ffolConstSymbols (problem.assumptions ++ problem.goals)

        constantName c =
            if List.member c problemConstants then
                name c

            else
                -- Skolem constants of the negated goal: they name the elements that falsify it
                name c ++ " (introduced by Mace4)"

        constants =
            if Dict.isEmpty i.const then
                ""

            else
                table [ "constant", "value" ] (List.map (\( c, v ) -> [ constantName c, el v ]) (Dict.toList i.const))

        function ( f, ( arity, values ) ) =
            let
                value args =
                    Dict.get args values |> Maybe.map el |> Maybe.withDefault "?"
            in
            case arity of
                1 ->
                    table ("x" :: List.map el elements) [ (name f ++ "(x)") :: List.map (\x -> value [ x ]) elements ]

                2 ->
                    table ((name f ++ "(x,y)") :: List.map (\y -> "y=" ++ el y) elements)
                        (List.map (\x -> ("x=" ++ el x) :: List.map (\y -> value [ x, y ]) elements) elements)

                _ ->
                    table [ name f ++ "(…)", "value" ]
                        (List.map (\( args, v ) -> [ name f ++ "(" ++ String.join "," (List.map el args) ++ ")", el v ]) (Dict.toList values))

        predicate ( p, ( arity, extension ) ) =
            let
                holds args =
                    if Set.member args extension then
                        "T"

                    else
                        "F"
            in
            case arity of
                0 ->
                    table [ name p ] [ [ holds [] ] ]

                1 ->
                    table ("x" :: List.map el elements) [ (name p ++ "(x)") :: List.map (\x -> holds [ x ]) elements ]

                2 ->
                    table ((name p ++ "(x,y)") :: List.map (\y -> "y=" ++ el y) elements)
                        (List.map (\x -> ("x=" ++ el x) :: List.map (\y -> holds [ x, y ]) elements) elements)

                _ ->
                    table [ name p ++ " holds for" ]
                        (List.map (\args -> [ "(" ++ String.join "," (List.map el args) ++ ")" ]) (Set.toList extension))

        truth f =
            case SS.ffolValuation f m of
                Just True ->
                    "true"

                Just False ->
                    "false"

                Nothing ->
                    "not defined"

        checks =
            table [ "formula", "value in the model" ]
                (List.map (\f -> [ SS.ffolToString f, truth f ]) problem.assumptions
                    ++ List.map (\f -> [ SS.ffolToString f ++ "   (goal)", truth f ]) problem.goals
                )
    in
    "<div class=\"lus-model\"><h3>"
        ++ "Model "
        ++ String.fromInt (index + 1)
        ++ ": universe {"
        ++ String.join ", " (List.map el elements)
        ++ "}</h3>"
        ++ constants
        ++ String.concat (List.map function (Dict.toList i.func))
        ++ String.concat (List.map predicate (Dict.toList i.pred))
        ++ checks
        ++ "</div>"
