module LTLProcessors exposing (..)

import LogicUS.TL.SyntaxSemanticsLTL exposing (fltlReadFromString, FormulaLTL(..), fltlToString)
import Json.Decode as JSOND
import Json.Encode as JSONE
import Dict exposing (Dict)
import List.Extra exposing (unconsLast)
import Maybe.Extra exposing (isNothing)
import List.Extra exposing (unique)
import Auxiliar exposing (uniqueConcatList)
import LogicUS.TL.SemanticTableauxLTL exposing (tableauLTLCompact)
import LogicUS.TL.SemanticTableauxLTL exposing (semanticTableauToDOT)
import LogicUS.TL.SemanticTableauxLTL exposing (LTLTableau, tableauBranchModels)
import Graph
import LogicUS.TL.SyntaxSemanticsLTL exposing (iltlToDOT)

processFormulaLTLNode : String -> { errorCode : Int, result : FormulaLTL, message : JSONE.Value }
processFormulaLTLNode content =
    case fltlReadFromString content of
        ( Nothing, _, errDetails ) ->
            { errorCode = 1, result = Insat, message = JSONE.string errDetails }

        ( Just f, _, _ ) ->
            { errorCode = 0, result = f, message = JSONE.string (fltlToString f) }


processSetLTLNode : String -> Dict ( Int, Int ) FormulaLTL -> Dict ( Int, Int ) (List FormulaLTL) -> { errorCode : Int, result : (List FormulaLTL), message : JSONE.Value }
processSetLTLNode content outputsFPL outputsSPL =
    let
        contentDecoder =
            JSOND.map2 (\x y -> { option = x, input = y }) (JSOND.at [ "option" ] JSOND.string) (JSOND.at [ "input" ] JSOND.string)

        inputDecoder =
            JSOND.list <| JSOND.map2 Tuple.pair (JSOND.at [ "origin_id" ] JSOND.int) (JSOND.at [ "origin_slot" ] JSOND.int)
    in
    case JSOND.decodeString contentDecoder content of
        Ok c ->
            case c.option of
                "fromFile" ->
                    let
                        parsedSet =
                            case unconsLast <| String.split "." c.input of
                                Just ( "", [] ) ->
                                    List.map fltlReadFromString [ "" ]

                                Just ( "", ls ) ->
                                    List.map fltlReadFromString ls

                                Just ( s, ls ) ->
                                    List.map fltlReadFromString (ls ++ [ s ])

                                Nothing ->
                                    List.map fltlReadFromString [ "" ]
                    in
                    if List.any (\( f, _, _ ) -> isNothing f) parsedSet then
                        { errorCode = 1
                        , result = []
                        , message =
                            JSONE.string
                                (String.join "." <|
                                    List.indexedMap
                                        (\i ( _, _, m ) ->
                                            if m /= "" then
                                                "f" ++ String.fromInt i ++ " : " ++ m

                                            else
                                                ""
                                        )
                                        parsedSet
                                )
                        }

                    else
                        let
                            fs =
                                unique <| List.map (\( f, _, _ ) -> Maybe.withDefault Insat f) parsedSet
                        in
                        { errorCode = 0, result = fs, message = JSONE.string ("{" ++ (String.join ", " <| List.map fltlToString fs) ++ "}") }

                "collect" ->
                    case JSOND.decodeString inputDecoder c.input of
                        Ok sources ->
                            let
                                fs =
                                    List.map (\x -> ( x, Dict.get x outputsFPL )) sources
                            in
                            case List.filter (isNothing << Tuple.second) fs of
                                [] ->
                                    let
                                        fs_ =
                                            unique <| List.map (Maybe.withDefault Insat << Tuple.second) fs
                                    in
                                    { errorCode = 0, result = fs_, message = JSONE.string ("{" ++ (String.join ", " <| List.map fltlToString fs_) ++ "}") }

                                undefSources ->
                                    { errorCode = 2, result = [], message = JSONE.string ("Unknown sources:" ++ (String.join ". " <| List.map (\( ( sid, sslot ), _ ) -> "(" ++ String.fromInt sid ++ ", " ++ String.fromInt sslot ++ ")") undefSources)) }

                        Err e ->
                            { errorCode = 3, result = [], message = JSONE.string (JSOND.errorToString e) }

                "union" ->
                    case JSOND.decodeString inputDecoder c.input of
                        Ok sources ->
                            let
                                fss =
                                    List.map (\x -> ( x, Dict.get x outputsSPL )) sources
                            in
                            case List.filter (isNothing << Tuple.second) fss of
                                [] ->
                                    let
                                        fs_ =
                                            unique <| List.foldl (\( _, fs ) gs -> uniqueConcatList gs (Maybe.withDefault [] fs)) [] fss
                                    in
                                    { errorCode = 0, result = fs_, message = JSONE.string ("{" ++ (String.join ", " <| List.map fltlToString fs_) ++ "}") }

                                undefSources ->
                                    { errorCode = 2, result = [], message = JSONE.string ("Unknown sources:" ++ (String.join ". " <| List.map (\( ( sid, sslot ), _ ) -> "(" ++ String.fromInt sid ++ ", " ++ String.fromInt sslot ++ ")") undefSources)) }

                        Err e ->
                            { errorCode = 3, result = [], message = JSONE.string (JSOND.errorToString e) }

                _ ->
                    { errorCode = 4, result = [], message = JSONE.string "undefined option for node of type SetLTL" }

        Err e ->
            { errorCode = 3, result = [], message = JSONE.string (JSOND.errorToString e) }


processSemanticTableauLTL : 
    String 
    -> Dict.Dict ( Int, Int ) FormulaLTL 
    -> Dict.Dict ( Int, Int ) (List FormulaLTL) 
    -> { errorCode : Int, resultMode : Int, message : JSONE.Value, tableau : LTLTableau }
processSemanticTableauLTL content outputsFLTL outputsSLTL =
    let
        contentDecoder =
            JSOND.map2 (\x y -> { option = x, input = y }) (JSOND.at [ "option" ] JSOND.string) (JSOND.at [ "input" ] JSOND.string)

        inputDecoder =
            JSOND.map2 (\x y -> { origin_id = x, origin_slot = y }) (JSOND.at [ "origin_id" ] JSOND.int) (JSOND.at [ "origin_slot" ] JSOND.int)

        optionDecoder = 
            JSOND.map2 (\x y -> { input_mode = x, perform_mode = y }) (JSOND.at [ "input_mode" ] JSOND.string) (JSOND.at [ "perform_mode" ] JSOND.string)
    in
    case JSOND.decodeString contentDecoder content of
        Ok c ->
            case JSOND.decodeString inputDecoder c.input of
                Ok source ->
                    case JSOND.decodeString optionDecoder c.option of
                        Ok o ->
                            case o.input_mode of 
                                "set" -> 
                                    case Dict.get ( source.origin_id, source.origin_slot ) outputsSLTL of
                                        Just s ->
                                            case o.perform_mode of
                                                "only tableau" ->
                                                    let
                                                        st =
                                                            tableauLTLCompact s
                                                    in
                                                    { errorCode = 0
                                                    , resultMode = 1
                                                    , message =
                                                        JSONE.object
                                                            [ ("graph", JSONE.string <| semanticTableauToDOT st) ]
                                                    , tableau = st
                                                    }

                                                _ ->
                                                    { errorCode = 4
                                                    , resultMode = 0
                                                    , message = JSONE.string ("Unknown option (" ++ o.perform_mode ++ ") for LTLSemanticTableau (SetPL)")
                                                    , tableau = Graph.empty
                                                    }

                                        Nothing ->
                                            { errorCode = 2
                                            , resultMode = 0
                                            , message = JSONE.string ("Unknown source (SetLTL): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ")")
                                            , tableau = Graph.empty
                                            }
                                
                                "formula" -> 
                                    case Dict.get ( source.origin_id, source.origin_slot ) outputsFLTL of
                                        Just f ->
                                            case o.perform_mode of
                                                "only tableau" ->
                                                    let
                                                        st =
                                                            tableauLTLCompact [f]
                                                    in
                                                    { errorCode = 0
                                                    , resultMode = 1
                                                    , message =
                                                        JSONE.object
                                                            [ ( "graph", JSONE.string <| semanticTableauToDOT st ) ]
                                                    , tableau = st
                                                    }

                                                _ ->
                                                    { errorCode = 4
                                                    , resultMode = 0
                                                    , message = JSONE.string ("Unknown options (" ++ o.perform_mode  ++ ") for LTLSemanticTableau (FormulaLTL)")
                                                    , tableau = Graph.empty
                                                    }

                                        Nothing ->
                                            { errorCode = 2
                                            , resultMode = 0
                                            , message = JSONE.string ("Unknown source (FormulaLTL): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ")")
                                            , tableau = Graph.empty
                                            }
                                _ ->
                                    { errorCode = 4
                                    , resultMode = 0
                                    , message = JSONE.string ("Unknown option (" ++ o.input_mode ++ ") for LTLSemanticTableau (FormulaLTL)")
                                    , tableau = Graph.empty
                                    }
                        
                        Err e ->
                            { errorCode = 3, resultMode = 0, message = JSONE.string (JSOND.errorToString e), tableau = Graph.empty}
                        
                Err e ->
                    { errorCode = 3, resultMode = 0, message = JSONE.string (JSOND.errorToString e), tableau = Graph.empty }

        Err e ->
            { errorCode = 3, resultMode = 0, message = JSONE.string (JSOND.errorToString e), tableau = Graph.empty }



processCheckTableauLTL : 
    String 
    -> Dict (Int, Int) (LTLTableau)
    -> { errorCode : Int, message : JSONE.Value }
processCheckTableauLTL content outputsSTLTL =
    let
        contentDecoder =
            JSOND.map (\x -> { input = x }) (JSOND.at [ "input" ] JSOND.string)

        inputDecoder =
            JSOND.map2 (\x y -> { origin_id = x, origin_slot = y }) (JSOND.at [ "origin_id" ] JSOND.int) (JSOND.at [ "origin_slot" ] JSOND.int)
    in
    case JSOND.decodeString contentDecoder content of
        Ok c ->
            case JSOND.decodeString inputDecoder c.input of
                Ok source ->
                    case Dict.get ( source.origin_id, source.origin_slot ) outputsSTLTL of
                        Just st ->
                            case tableauBranchModels st of
                                i::_ ->
                                    { errorCode = 0
                                    , message =
                                        JSONE.object
                                            [ ("graph", JSONE.string <| iltlToDOT i) ]
                                    }

                                _ ->
                                    { errorCode = 1
                                    , message = JSONE.string ("UNSATISFIABLE")
                                    }

                        Nothing ->
                            { errorCode = 2
                            , message = JSONE.string ("Unknown source (SemanticTableauLTL): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ")")
                            }
                        
                Err e ->
                    { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }
        Err e ->
            { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }