package com.smartgift.repository;

import com.smartgift.model.WishItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishItemRepository extends JpaRepository<WishItemEntity, String> {
    List<WishItemEntity> findByOwnerId(String ownerId);
}
