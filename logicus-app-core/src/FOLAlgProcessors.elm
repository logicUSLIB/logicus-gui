module FOLAlgProcessors exposing (..)

import Dict
import Json.Decode as JSOND
import Json.Encode as JSONE
import LogicUS.FOL.Clauses exposing (ClauseFOLSet)
import LogicUS.FOL.Resolution as LUSF_RES
import LogicUS.FOL.SemanticTableauxEQ as LUSF_PLSTEQ
import LogicUS.FOL.SemanticTableaux as LUSF_PLST
import LogicUS.FOL.SyntaxSemantics exposing (SetFOL)
import LogicUS.FOL.SyntaxSemantics exposing (FormulaFOL)


processSemanticTableauFOL : String -> Dict.Dict ( Int, Int ) FormulaFOL -> Dict.Dict ( Int, Int ) SetFOL -> { errorCode : Int, message : JSONE.Value }
processSemanticTableauFOL content outputsFFOL outputsSFOL =
    let
        contentDecoder =
            JSOND.map2 (\x  y -> { input = x, option=y }) (JSOND.at [ "input" ] JSOND.string) (JSOND.at [ "option" ] JSOND.string)

        inputDecoder =
            JSOND.map2 (\x y -> { origin_id = x, origin_slot = y }) (JSOND.at [ "origin_id" ] JSOND.int) (JSOND.at [ "origin_slot" ] JSOND.int)

        optionDecoder =
            JSOND.map4 (\x y z u -> { input_mode = x, perform_mode = y, maxSD = z, maxCU = u }) 
                (JSOND.at [ "input_mode" ] JSOND.string) 
                (JSOND.at [ "perform_mode" ] JSOND.string) 
                (JSOND.at [ "maxSD" ] JSOND.int) 
                (JSOND.at [ "maxCU" ] JSOND.int)
    in
    case JSOND.decodeString contentDecoder content of
        Ok c ->
            case JSOND.decodeString inputDecoder c.input of
                Ok source ->
                    case JSOND.decodeString optionDecoder c.option of
                        Ok o ->
                            case o.input_mode of
                                "sfol" -> 
                                    case Dict.get ( source.origin_id, source.origin_slot ) outputsSFOL of
                                        Just s ->
                                            case o.perform_mode of
                                                "enhanced" -> 
                                                    { errorCode = 0
                                                    , message = JSONE.string <| LUSF_PLSTEQ.semanticTableauToDOT (LUSF_PLSTEQ.semanticTableauEq s o.maxCU o.maxSD) ""
                                                    }

                                                "basic" -> 
                                                    { errorCode = 0
                                                    , message = JSONE.string <| LUSF_PLST.semanticTableauToDOT (LUSF_PLST.semanticTableau s o.maxCU o.maxSD)
                                                    }

                                                _ -> 
                                                    { errorCode = 4
                                                    , message = JSONE.string ("Unknown performMode: (" ++ o.perform_mode ++ ") for SemanticTableauFOL")
                                                    }

                                        Nothing ->
                                            { errorCode = 2
                                            , message = JSONE.string ("Unknown source (SetFOL): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ") for SemanticTableauFOL")
                                            }
                                
                                "ffol" ->
                                    case Dict.get ( source.origin_id, source.origin_slot ) outputsFFOL of
                                        Just f ->
                                            case o.perform_mode of
                                                "enhanced" -> 
                                                    { errorCode = 0
                                                    , message = JSONE.string <| LUSF_PLSTEQ.semanticTableauToDOT (LUSF_PLSTEQ.semanticTableauEq [f] o.maxCU o.maxSD) ""
                                                    }

                                                "basic" -> 
                                                    { errorCode = 0
                                                    , message = JSONE.string <| LUSF_PLST.semanticTableauToDOT (LUSF_PLST.semanticTableau [f] o.maxCU o.maxSD)
                                                    }

                                                _ -> 
                                                    { errorCode = 4
                                                    , message = JSONE.string ("Unknown performMode: (" ++ o.perform_mode ++ ") for SemanticTableauFOL")
                                                    }

                                        Nothing ->
                                            { errorCode = 2
                                            , message = JSONE.string ("Unknown source (FormulaFOL): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ") for SemanticTableauFOL")
                                            }

                                _ -> 
                                    { errorCode = 4
                                    , message = JSONE.string ("Unknown inputMode: (" ++ o.input_mode ++ ") for SemanticTableauFOL")
                                    }
                        
                        Err e ->
                            { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }
                Err e ->
                    { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }

        Err e ->
            { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }


processResolutionGraphFOL : String -> Dict.Dict ( Int, Int ) ClauseFOLSet -> { errorCode : Int, message : JSONE.Value }
processResolutionGraphFOL content outputsCSFOL =
    let
        contentDecoder =
            JSOND.map2 (\x y -> { option = x, input = y }) (JSOND.at [ "option" ] JSOND.string) (JSOND.at [ "input" ] JSOND.string)

        inputDecoder =
            JSOND.map2 (\x y -> { origin_id = x, origin_slot = y }) (JSOND.at [ "origin_id" ] JSOND.int) (JSOND.at [ "origin_slot" ] JSOND.int)
    in
    case JSOND.decodeString contentDecoder content of
        Ok c ->
            case JSOND.decodeString inputDecoder c.input of
                Ok source ->
                    case Dict.get ( source.origin_id, source.origin_slot ) outputsCSFOL of
                        Just cs ->
                            case c.option of
                                "standard" ->
                                    { errorCode = 0
                                    , message = JSONE.string <| LUSF_RES.resolutionTableauToDOT <| Tuple.second <| LUSF_RES.csfolSCFResolution <| cs
                                    }

                                "linear" ->
                                    { errorCode = 0
                                    , message = JSONE.string <| LUSF_RES.resolutionTableauToDOT <| Tuple.second <| LUSF_RES.csfolSCFResolution <| cs
                                    }

                                "positive" ->
                                    { errorCode = 0
                                    , message = JSONE.string <| LUSF_RES.resolutionTableauToDOT <| Tuple.second <| LUSF_RES.csfolSCFResolution <| cs
                                    }

                                "negative" ->
                                    { errorCode = 0
                                    , message = JSONE.string <| LUSF_RES.resolutionTableauToDOT <| Tuple.second <| LUSF_RES.csfolSCFResolution <| cs
                                    }

                                _ ->
                                    { errorCode = 4
                                    , message = JSONE.string ("Unknown option (" ++ c.option ++ ") for ResolutionGraphFOL")
                                    }

                        Nothing ->
                            { errorCode = 2
                            , message = JSONE.string ("Unknown source: (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ")")
                            }

                Err e ->
                    { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }

        Err e ->
            { errorCode = 3, message = JSONE.string (JSOND.errorToString e) }
