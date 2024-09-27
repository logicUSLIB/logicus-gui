module KLBasicProcessors exposing (processFormulaKLNode,processSetKLNode, processViewKLModel)

-- import LogicUS.PL.SemanticTableaux as LUS_ST

import Auxiliar as Aux
import Dict
import Json.Decode as JSOND
import Json.Encode as JSONE
import List.Extra as ListE
import LogicUS.KL.SyntaxSemantics as LUS_SS exposing (..)
import Maybe.Extra as MaybeE
import Dict exposing (Dict)
import LogicUS.KL.SemanticTableauxS5 exposing (kStructToDOT)



-- FormulaPL Node


processFormulaKLNode : String -> { errorCode : Int, result : MForm, message : JSONE.Value }
processFormulaKLNode content =
    case LUS_SS.mformReadFromString content of
        ( Nothing, _, errDetails ) ->
            { errorCode = 1, result = Insat, message = JSONE.string errDetails }

        ( Just f, _, _ ) ->
            { errorCode = 0, result = f, message = JSONE.string (LUS_SS.mformToString f) }



-- -- SetPL Node


processSetKLNode : String -> Dict.Dict ( Int, Int ) MForm -> Dict.Dict ( Int, Int ) (List MForm) -> { errorCode : Int, result : (List MForm), message : JSONE.Value }
processSetKLNode content outputsFPL outputsSPL =
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
                            case ListE.unconsLast <| String.split "." c.input of
                                Just ( "", [] ) ->
                                    List.map LUS_SS.mformReadFromString [ "" ]

                                Just ( "", ls ) ->
                                    List.map LUS_SS.mformReadFromString ls

                                Just ( s, ls ) ->
                                    List.map LUS_SS.mformReadFromString (ls ++ [ s ])

                                Nothing ->
                                    List.map LUS_SS.mformReadFromString [ "" ]
                    in
                    if List.any (\( f, _, _ ) -> MaybeE.isNothing f) parsedSet then
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
                                ListE.unique <| List.map (\( f, _, _ ) -> Maybe.withDefault Insat f) parsedSet
                        in
                        { errorCode = 0, result = fs, message = JSONE.string (mfSetToString fs) }

                "collect" ->
                    case JSOND.decodeString inputDecoder c.input of
                        Ok sources ->
                            let
                                fs =
                                    List.map (\x -> ( x, Dict.get x outputsFPL )) sources
                            in
                            case List.filter (MaybeE.isNothing << Tuple.second) fs of
                                [] ->
                                    let
                                        fs_ =
                                            ListE.unique <| List.map (Maybe.withDefault LUS_SS.Insat << Tuple.second) fs
                                    in
                                    { errorCode = 0, result = fs_, message = JSONE.string (mfSetToString fs_) }

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
                            case List.filter (MaybeE.isNothing << Tuple.second) fss of
                                [] ->
                                    let
                                        fs_ =
                                            ListE.unique <| List.foldl (\( _, fs ) gs -> Aux.uniqueConcatList gs (Maybe.withDefault [] fs)) [] fss
                                    in
                                    { errorCode = 0, result = fs_, message = JSONE.string (mfSetToString fs_) }

                                undefSources ->
                                    { errorCode = 2, result = [], message = JSONE.string ("Unknown sources:" ++ (String.join ". " <| List.map (\( ( sid, sslot ), _ ) -> "(" ++ String.fromInt sid ++ ", " ++ String.fromInt sslot ++ ")") undefSources)) }

                        Err e ->
                            { errorCode = 3, result = [], message = JSONE.string (JSOND.errorToString e) }

                _ ->
                    { errorCode = 4, result = [], message = JSONE.string "undefined option for node of type SetPL" }

        Err e ->
            { errorCode = 3, result = [], message = JSONE.string (JSOND.errorToString e) }


processViewKLModel : 
    String 
    -> Dict (Int, Int) KripkeStructure
    -> { errorCode : Int, message : JSONE.Value }
processViewKLModel content outputsKS =
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
                    case Dict.get ( source.origin_id, source.origin_slot ) outputsKS of
                        Just ks ->
                            { errorCode = 0
                            , message =
                                JSONE.string <| kStructToDOT ks ["maroon", "#00CED1", "orange", "navy", "green", "red", "yellow", "fushsia", "olive", "blue"]
                            }

            

                        Nothing ->
                            { errorCode = 2
                            , message = JSONE.string ("Unknown source (KStructure): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ")")
                            }
                        
                Err e ->
                    { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }
        Err e ->
            { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }