#include <stdio.h>
#include <string.h>

#define MAX_STR_LEN 80
#define NUM_STRINGS 5

void swap(char *a, char *b) {
    char temp[MAX_STR_LEN];
    strcpy(temp, a);
    strcpy(a, b);
    strcpy(b, temp);
}

int main() {
    char strs[NUM_STRINGS][MAX_STR_LEN];
    int i, j;

    // ¶ÁÈ¡×Ö·û´®
    for (i = 0; i < NUM_STRINGS; i++) {
        scanf("%s", strs[i]);
    }

    // Ã°ÅÝÅÅÐò
    for (i = 0; i < NUM_STRINGS - 1; i++) {
        for (j = 0; j < NUM_STRINGS - 1 - i; j++) {
            if (strcmp(strs[j], strs[j + 1]) > 0) {
                swap(strs[j], strs[j + 1]);
            }
        }
    }

    // Êä³öÅÅÐòºóµÄ×Ö·û´®
    for (i = 0; i < NUM_STRINGS; i++) {
        printf("%s\n", strs[i]);
    }

    return 0;
}
