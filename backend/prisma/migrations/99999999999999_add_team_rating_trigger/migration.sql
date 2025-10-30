-- Create function to calculate team rating based on member ratings
CREATE OR REPLACE FUNCTION update_team_rating()
RETURNS TRIGGER AS $$
DECLARE
    team_id_to_update INTEGER;
    avg_rating INTEGER;
BEGIN
    -- Determine which team to update based on the operation
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        team_id_to_update := NEW."teamId";
    ELSIF TG_OP = 'DELETE' THEN
        team_id_to_update := OLD."teamId";
    END IF;

    -- Calculate average rating of team members
    SELECT COALESCE(ROUND(AVG(pa.rating)), 0)
    INTO avg_rating
    FROM "_TeamMembers" tm
    JOIN "PlayerAccount" pa ON tm."B" = pa.id
    WHERE tm."A" = team_id_to_update;

    -- Update the team's rating
    UPDATE "Team"
    SET rating = avg_rating
    WHERE id = team_id_to_update;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on the _TeamMembers relation table
-- This trigger fires whenever a player is added or removed from a team
DROP TRIGGER IF EXISTS trigger_update_team_rating ON "_TeamMembers";

CREATE TRIGGER trigger_update_team_rating
AFTER INSERT OR DELETE OR UPDATE ON "_TeamMembers"
FOR EACH ROW
EXECUTE FUNCTION update_team_rating();

-- Also create a trigger for when player ratings change
CREATE OR REPLACE FUNCTION update_all_team_ratings_for_player()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all teams this player is a member of
    UPDATE "Team" t
    SET rating = (
        SELECT COALESCE(ROUND(AVG(pa.rating)), 0)
        FROM "_TeamMembers" tm
        JOIN "PlayerAccount" pa ON tm."B" = pa.id
        WHERE tm."A" = t.id
    )
    WHERE t.id IN (
        SELECT tm."A"
        FROM "_TeamMembers" tm
        WHERE tm."B" = NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_ratings_on_player_rating_change ON "PlayerAccount";

CREATE TRIGGER trigger_update_team_ratings_on_player_rating_change
AFTER UPDATE OF rating ON "PlayerAccount"
FOR EACH ROW
WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
EXECUTE FUNCTION update_all_team_ratings_for_player();