module KLAlgProcessors exposing (processSemanticTableauS5)
import Dict exposing (Dict)
import LogicUS.KL.SyntaxSemantics exposing (MForm)
import Json.Encode as JSONE
import Json.Decode as JSOND
import LogicUS.KL.SemanticTableauxS5 as S5
import LogicUS.KL.SyntaxSemantics exposing (KripkeStructure)

processSemanticTableauS5 : String -> Dict ( Int, Int ) MForm -> Dict ( Int, Int ) (List MForm) -> { errorCode : Int, message : JSONE.Value, models : List KripkeStructure }
processSemanticTableauS5 content outputsFKL outputsSKL =
    let
        contentDecoder =
            JSOND.map2 (\x  y -> { input = x, option=y }) (JSOND.at [ "input" ] JSOND.string) (JSOND.at [ "option" ] JSOND.string)

        inputDecoder =
            JSOND.map2 (\x y -> { origin_id = x, origin_slot = y }) (JSOND.at [ "origin_id" ] JSOND.int) (JSOND.at [ "origin_slot" ] JSOND.int)

        optionDecoder =
            JSOND.map2 (\x y -> { input_mode = x, perform_mode = y }) 
                (JSOND.at [ "input_mode" ] JSOND.string) 
                (JSOND.at [ "perform_mode" ] JSOND.string) 
    in
    case JSOND.decodeString contentDecoder content of
        Ok c ->
            case JSOND.decodeString inputDecoder c.input of
                Ok source ->
                    case JSOND.decodeString optionDecoder c.option of
                        Ok o ->
                            case o.input_mode of
                                "set" -> 
                                    case Dict.get ( source.origin_id, source.origin_slot ) outputsSKL of
                                        Just s ->
                                            case o.perform_mode of
                                                "compact" -> 
                                                    { errorCode = 0
                                                    , message = JSONE.object 
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauCompactToDOT (S5.semanticTableau s))
                                                        , ("models", JSONE.int 0)
                                                        ]
                                                    , models = []
                                                    }
                                                
                                                "compact+models" ->
                                                    let
                                                        t = (S5.semanticTableau s)
                                                        t_models = S5.tableauModels t
                                                    in
                                                    
                                                    { errorCode = 0
                                                    , message = JSONE.object 
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauCompactToDOT t)
                                                        , ("models", JSONE.int ( List.length t_models))
                                                        ]
                                                    , models = t_models
                                                    }

                                                "basic" -> 
                                                    { errorCode = 0
                                                    , message =  JSONE.object
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauToDOT (S5.semanticTableau s))
                                                        , ("models", JSONE.int 0)
                                                        ]
                                                    , models = []
                                                    }

                                                "basic+models" ->
                                                    let
                                                        t = (S5.semanticTableau s)
                                                        t_models = S5.tableauModels t
                                                    in
                                                    
                                                    { errorCode = 0
                                                    , message = JSONE.object 
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauToDOT t)
                                                        , ("models", JSONE.int ( List.length t_models))
                                                        ]
                                                    , models = t_models
                                                    }


                                                _ -> 
                                                    { errorCode = 4
                                                    , message = JSONE.string ("Unknown performMode: (" ++ o.perform_mode ++ ") for SemanticTableauKL"), models=[]
                                                    }

                                        Nothing ->
                                            { errorCode = 2
                                            , message = JSONE.string ("Unknown source (SetKL): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ") for SemanticTableauKL")
                                            , models = []
                                            }
                                
                                "formula" ->
                                    case Dict.get ( source.origin_id, source.origin_slot ) outputsFKL of
                                        Just f ->
                                            case o.perform_mode of
                                                "compact" -> 
                                                    { errorCode = 0
                                                    , message = JSONE.object
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauCompactToDOT (S5.semanticTableau [f]))
                                                        , ("models", JSONE.int 0)
                                                        ]
                                                    , models=[]}
                                                
                                                "compact+models" ->
                                                    let
                                                        t = (S5.semanticTableau [f])
                                                        t_models = S5.tableauModels t
                                                    in
                                                    
                                                    { errorCode = 0
                                                    , message = JSONE.object 
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauCompactToDOT t)
                                                        , ("models", JSONE.int ( List.length t_models))
                                                        ]
                                                    , models = t_models
                                                    }

                                                "basic" -> 
                                                    { errorCode = 0
                                                    , message = JSONE.object
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauToDOT (S5.semanticTableau [f]))
                                                        , ("models", JSONE.int 0)
                                                        ]
                                                    , models = []
                                                    }

                                                "basic+models" ->
                                                    let
                                                        t = (S5.semanticTableau [f])
                                                        t_models = S5.tableauModels t
                                                    in
                                                    
                                                    { errorCode = 0
                                                    , message = JSONE.object 
                                                        [( "tableauDOT" , JSONE.string <| S5.tableauToDOT t)
                                                        , ("models", JSONE.int ( List.length t_models))
                                                        ]
                                                    , models = t_models
                                                    }

                                                _ -> 
                                                    { errorCode = 4
                                                    , message = JSONE.string ("Unknown performMode: (" ++ o.perform_mode ++ ") for SemanticTableauKL")
                                                    , models = []
                                                    }

                                        Nothing ->
                                            { errorCode = 2
                                            , message = JSONE.string ("Unknown source (FormulaKL): (" ++ String.fromInt source.origin_id ++ ", " ++ String.fromInt source.origin_slot ++ ") for SemanticTableauKL")
                                            , models = []
                                            }

                                _ -> 
                                    { errorCode = 4
                                    , message = JSONE.string ("Unknown inputMode: (" ++ o.input_mode ++ ") for SemanticTableauKL")
                                    , models = []
                                    }
                        
                        Err e ->
                            { errorCode = 3, message = JSONE.string (JSOND.errorToString e), models=[] }
                Err e ->
                    { errorCode = 3, message = JSONE.string (JSOND.errorToString e), models=[] }

        Err e ->
            { errorCode = 3, message = JSONE.string (JSOND.errorToString e), models=[] }