module ForeignOperators exposing (canonicFO, fplConservativeRetraction, splConservativeRetraction)

{-| Foreign (forgetting) operators and conservative retraction for propositional logic.

Copied from `LogicUS.PL.ForeignOperators` in the logicus-pl repository, which is not an exposed module of the
published package (4.1.0). Move it back to the package when it is exposed there.

-}

import List.Extra as LE
import LogicUS.PL.SyntaxSemantics exposing (FormulaPL(..), PSymb, SetPL, fplSymbols, splSymbols)


setMinus : List a -> List a -> List a
setMinus xs ys =
    List.filter (\x -> not <| List.member x ys) xs



{- It simplifies the tautology or insat symbol (if it proceeds). It operates only in the first level, that is, it does not go recursively over the formula. -}


sigma : FormulaPL -> FormulaPL
sigma g =
    case g of
        Neg Taut ->
            Insat

        Neg Insat ->
            Taut

        Conj Taut h ->
            h

        Conj h Taut ->
            h

        Conj Insat _ ->
            Insat

        Conj _ Insat ->
            Insat

        Disj Taut _ ->
            Taut

        Disj _ Taut ->
            Taut

        Disj f1 (Neg f2) ->
            if f1 == f2 then  Taut else g

        Disj Insat h ->
            h

        Disj h Insat ->
            h

        Impl Taut h ->
            h

        Impl _ Taut ->
            Taut

        Impl Insat _ ->
            Taut

        Impl h Insat ->
            sigma (Neg h)

        Equi h Taut ->
            h

        Equi Taut h ->
            h

        Equi Insat h ->
            sigma (Neg h)

        Equi h Insat ->
            sigma (Neg h)

        _ ->
            g



{- Having in cosideration that in canonic foreign operator δ⁰ₚ F ≣ σ(F{p/⊤} ∨ F{p/⊥}) then we separate the operation in two parts, performing sigma simplifications by the time the substitutions are maked. -}


canonicFO : FormulaPL -> PSymb -> FormulaPL
canonicFO f p =
    if List.member p (fplSymbols f) then
        sigma (Disj (canonicFOT f p) (canonicFOF f p))

    else
        f


canonicFOT : FormulaPL -> PSymb -> FormulaPL
canonicFOT f p =
    case f of
        Atom q ->
            if p == q then
                Taut

            else
                Atom q

        Neg g ->
            sigma (Neg (canonicFOT g p))

        Conj g h ->
            sigma (Conj (canonicFOT g p) (canonicFOT h p))

        Disj g h ->
            sigma (Disj (canonicFOT g p) (canonicFOT h p))

        Impl g h ->
            sigma (Impl (canonicFOT g p) (canonicFOT h p))

        Equi g h ->
            sigma (Equi (canonicFOT g p) (canonicFOT h p))

        _ ->
            f


canonicFOF : FormulaPL -> PSymb -> FormulaPL
canonicFOF f p =
    case f of
        Atom q ->
            if p == q then
                Insat

            else
                Atom q

        Neg g ->
            sigma (Neg (canonicFOF g p))

        Conj g h ->
            sigma (Conj (canonicFOF g p) (canonicFOF h p))

        Disj g h ->
            sigma (Disj (canonicFOF g p) (canonicFOF h p))

        Impl g h ->
            sigma (Impl (canonicFOF g p) (canonicFOF h p))

        Equi g h ->
            sigma (Equi (canonicFOF g p) (canonicFOF h p))

        _ ->
            f



{- It performs conservative retraction to the original language (taken as the set of symbols in the formulas) with forgetting the set of symbols given -}


fplConservativeRetraction : FormulaPL -> List PSymb -> FormulaPL
fplConservativeRetraction f ls =
    let
        lsf =
            List.sort <| LE.unique <| setMinus (fplSymbols f) ls
    in
    List.foldl (\p g -> canonicFO g p) f lsf


splConservativeRetraction : SetPL -> List PSymb -> SetPL
splConservativeRetraction fs ls =
    let
        lsf =
            List.sort <| LE.unique <| setMinus (splSymbols fs) ls
    in
    List.foldl (\p gs -> List.map (\g -> canonicFO g p) gs) fs lsf
